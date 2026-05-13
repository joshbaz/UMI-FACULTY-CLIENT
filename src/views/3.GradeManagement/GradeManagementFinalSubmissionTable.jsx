import React, { useState, useMemo, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/utils/tanstack";
import {
  sendResultsEmailService
} from "@/store/tanstackStore/services/api";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox.jsx";
import * as XLSX from 'xlsx';

const columnHelper = createColumnHelper();

const getStudentMarks = (row) => {
  let textMarks = { internal: 0, external: 0 };
  const currentAssignments = row.examinerAssignments?.filter(a => a.isCurrent);
  currentAssignments?.forEach(a => {
    if (a.examiner?.type === 'Internal') textMarks.internal = a.grade || 0;
    if (a.examiner?.type === 'External') textMarks.external = a.grade || 0;
  });

  const currentViva = row.vivaHistory?.find(v => v.isCurrent);
  const vivaMarks = {
    internal: currentViva?.internalMark || 0,
    external: currentViva?.externalMark || 0
  };

  return { textMarks, vivaMarks };
};

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item) || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Separate component for school tables to avoid Rules of Hooks violation
const SchoolTable = ({ schoolName, schoolData, onExport, currentAcademicYear, getColumnsForTab, tab = "results-approved-at-centre" }) => {
  const table = useReactTable({
    data: schoolData,
    columns: getColumnsForTab(tab),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {schoolName} ({schoolData.length} students)
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onExport(schoolName, schoolData)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export {schoolName}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-2 py-2 text-xs border border-gray-200 text-center"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center py-8 text-gray-500">
                  No data available for this school.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GradeManagementFinalSubmissionTable = ({ data }) => {
  const [activeTab, setActiveTab] = useState("results-sent");
  const [selectedBook, setSelectedBook] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [isSendToSchoolDialogOpen, setIsSendToSchoolDialogOpen] = useState(false);
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);

  useEffect(() => {
    setRowSelection({});
  }, [activeTab]);

  // Filter books based on criteria
  const filteredData = useMemo(() => {
    return (data || []).filter(book => {
      const isCurrentBook = book.isCurrent === true;
      const hasFinalStatus = book.student?.statuses?.some(status =>
        status.definition?.name === 'final dissertation & compliance report received'
      );
      const isNotGraduated = !book.student?.statuses?.some(status =>
        status.isCurrent &&
        status.definition?.name === 'graduated'
      );
      return isCurrentBook && hasFinalStatus && isNotGraduated;
    });
  }, [data]);

  // Data subsets for each tab

  const resultsSentData = useMemo(() => {
    return filteredData.filter(book => {
      const hasResultsSentDate = book.student?.resultsSentDate;
      const hasResultsSentToSchoolsStatus = book.student?.statuses?.some(status =>
        status.isCurrent && status.definition?.name === 'results sent to schools'
      );
      const hasSenateApprovalDate = book.student?.senateApprovalDate;

      return (hasResultsSentDate || hasResultsSentToSchoolsStatus) && !hasSenateApprovalDate;
    });
  }, [filteredData]);

  const groupedBySchoolForSentData = useMemo(() => {
    return groupBy(resultsSentData, row => row.student?.school?.name || row.student?.campus?.location || 'Unknown');
  }, [resultsSentData]);

  // Compute the current academic year from filteredData
  const currentAcademicYear = useMemo(() => {
    // Get all academic years from filteredData
    const years = filteredData
      .map(book => book.student?.academicYear)
      .filter(Boolean);
    if (years.length === 0) return '';
    // Option 1: Use the most common year
    const freq = {};
    years.forEach(y => { freq[y] = (freq[y] || 0) + 1; });
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    return mostCommon;
  }, [filteredData]);

  // Reports table columns based on the image
  const reportsColumns = useMemo(() => [
    columnHelper.accessor((row, index) => index + 1, {
      header: "No",
      id: "no",
      size: 40,
    }),
    columnHelper.accessor(row => row.student?.fullName || "N/A", {
      header: "NAME",
      id: "studentName",
      size: 160,
    }),
    columnHelper.accessor("student.registrationNumber", {
      header: "REG. NO",
      id: "registrationNo",
      cell: info => info.getValue() || "N/A",
      size: 120,
    }),
    columnHelper.accessor(row => row?.student?.gender === "male" ? "M" : "F" || "N/A", {
      header: "GENDER",
      id: "gender",
      size: 60,
    }),
    columnHelper.accessor(row => row.student?.course?.code || row.student?.course?.title || "N/A", {
      header: "COURSE",
      id: "course",
      size: 80,
    }),
    columnHelper.accessor(row => row.student?.academicYear || "N/A", {
      header: "YEAR OF ENROLLMENT",
      id: "yearOfEnrollment",
      size: 120,
    }),
    columnHelper.accessor(row => row.student?.campus?.location || "N/A", {
      header: "CAMPUS",
      id: "campus",
      size: 80,
    }),
    columnHelper.group({
      header: 'L.E. text',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).textMarks.internal, {
          header: '(100%)',
          id: 'le_text_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).textMarks.internal * 0.2, {
          header: '(20%)',
          id: 'le_text_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.group({
      header: 'E.E. text',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).textMarks.external, {
          header: '(100%)',
          id: 'ee_text_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).textMarks.external * 0.4, {
          header: '(40%)',
          id: 'ee_text_40',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.accessor(row => (getStudentMarks(row).textMarks.internal * 0.2) + (getStudentMarks(row).textMarks.external * 0.4), {
      header: 'Total text mark (out of 60)',
      id: 'total_text_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 100,
    }),
    columnHelper.group({
      header: 'L.E. viva',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal, {
          header: '(100%)',
          id: 'le_viva_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal * 0.2, {
          header: '(20%)',
          id: 'le_viva_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.group({
      header: 'E.E. viva',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external, {
          header: '(100%)',
          id: 'ee_viva_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external * 0.2, {
          header: '(20%)',
          id: 'ee_viva_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.accessor(row => (getStudentMarks(row).vivaMarks.internal * 0.2) + (getStudentMarks(row).vivaMarks.external * 0.2), {
      header: 'Total viva mark (out of 40)',
      id: 'total_viva_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 100,
    }),
    columnHelper.accessor(row => {
      const { textMarks, vivaMarks } = getStudentMarks(row);
      const textTotal = (textMarks.internal * 0.2) + (textMarks.external * 0.4);
      const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
      return textTotal + vivaTotal;
    }, {
      header: 'Final Dissertation mark (out of 100)',
      id: 'final_dissertation_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 120,
    }),
    columnHelper.accessor(row => row.vivaHistory?.find(v => v.isCurrent)?.status || 'Complete', {
      header: 'Status',
      id: 'status',
      size: 100,
    })
  ], []);

  // Mutations removed for Faculty Client (View Only)
  const sendResultsEmailMutation = useMutation({
    mutationFn: sendResultsEmailService,
    onSuccess: (data, variables) => {
      toast.success(`Results sent to ${variables.schoolName} successfully.`);
      setIsSendToSchoolDialogOpen(false);
      setSelectedSchoolData(null);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      console.error('Email sending failed:', error);
      toast.error(`Error sending results: ${error.message || 'Failed to send email'}`);
    }
  });

  const handleSenateApproveSchool = (schoolData) => {
    // Removed for Faculty Client
  };

  const confirmSenateApprove = () => {
    // Removed for Faculty Client
  };

  // Use the same reportsColumns for all tabs, but add checkbox for first three tabs
  const getColumnsForTab = (tab) => {
    return reportsColumns;
  };

  const tableInstances = {
    "results-sent": useReactTable({
      data: resultsSentData,
      columns: getColumnsForTab("results-sent"),
      state: { rowSelection },
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
      getCoreRowModel: getCoreRowModel(),
    }),
  };

  const currentTable = tableInstances[activeTab];



  const handleExportAllTab = () => {
    let exportData = resultsSentData;
    let columns = getColumnsForTab("results-sent").filter(col => col.id !== 'select');
    let sheetTitle = "Results Sent to School";

    const headers = columns.map(col => typeof col.header === 'string' ? col.header : '');
    let ws_data = [];
    ws_data.push(["UGANDA MANAGEMENT INSTITUTE"]);
    ws_data.push([`PROVISIONAL DISSERTATION EXAMINATION RESULTS - ${sheetTitle}`]);
    ws_data.push([]);
    ws_data.push(headers);
    exportData.forEach((row, idx) => {
      const rowData = columns.map(col => {
        if (typeof col.accessorFn === 'function') return col.accessorFn(row, idx);
        return '';
      });
      ws_data.push(rowData);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `grade_report_${activeTab}.xlsx`);
  };

  const handleExportSchoolData = (schoolName, schoolData) => {
    const wb = XLSX.utils.book_new();
    const headers = ["No", "NAME", "REG. NO", "GENDER", "COURSE", "YEAR OF ENROLLMENT", "CAMPUS", "Final mark", "Status"];
    const ws_data = [["UGANDA MANAGEMENT INSTITUTE"], [schoolName], [], headers];
    schoolData.forEach((book, index) => {
      const { textMarks, vivaMarks } = getStudentMarks(book);
      const finalMark = (textMarks.internal * 0.2) + (textMarks.external * 0.4) + (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);

      const courseName = typeof book.student?.course === 'string'
        ? book.student.course
        : (book.student?.course?.code || book.student?.course?.title || "N/A");

      ws_data.push([
        index + 1,
        book.student?.fullName || "N/A",
        book.student?.registrationNumber || "N/A",
        book.student?.gender === "male" ? "M" : "F" || "N/A",
        courseName,
        book.student?.academicYear || "N/A",
        book.student?.campus?.location || "N/A",
        finalMark.toFixed(0),
        "Complete"
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `${schoolName}_Results.xlsx`);
  };

  const TableComponent = ({ table }) => (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200" style={{ width: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-2 py-2 text-xs border border-gray-200 text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <nav className="flex -mb-px gap-4 justify-end">
          {["results-sent"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-xs font-medium rounded-lg capitalize ${activeTab === tab ? "bg-[#E8EAF6] text-[#23388F] border-2 border-[#23388F]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
            >
              {tab === "results-sent" ? "Results Sent to School" : tab.replace(/-/g, ' ')}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'results-sent' ? (
          <div className="space-y-6">
            {Object.entries(groupedBySchoolForSentData).map(([schoolName, schoolData]) => (
              <SchoolTable key={schoolName} schoolName={schoolName} schoolData={schoolData} onExport={handleExportSchoolData} currentAcademicYear={currentAcademicYear} getColumnsForTab={getColumnsForTab} tab="results-sent" />
            ))}
          </div>
        ) : null}
      </div>

      {/* Dialogs removed for Faculty Client */}
    </div>
  );
};

export default GradeManagementFinalSubmissionTable;
