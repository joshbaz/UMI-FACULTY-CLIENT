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

const GroupedReportTable = ({ items, reportsColumns, TableComponent }) => {
  const table = useReactTable({
    data: items,
    columns: reportsColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <TableComponent table={table} />;
};

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

const GradeManagementFinalSubmissionTable = ({ data, pageSize, setPageSize, currentPage, setCurrentPage, totalCount }) => {
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

  const senateApprovalData = useMemo(() => {
    return filteredData.filter(book => {
      const hasSenateApprovalDate = book.student?.senateApprovalDate;
      const hasResultsApprovedBySenateStatus = book.student?.statuses?.some(status =>
        status.isCurrent && status.definition?.name === 'results approved by senate'
      );

      return hasSenateApprovalDate || hasResultsApprovedBySenateStatus;
    });
  }, [filteredData]);

  // Group data for reports tab
  const groupedReportsData = useMemo(() => {
    // Use student.course and student.school if available, fallback to registrationNumber and campus.location
    return groupBy(filteredData, row => row.student?.course || row.student?.registrationNumber?.split('/')[2] || 'Unknown');
  }, [filteredData]);

  // For each course, group by school (or campus/location)
  const groupedByCourseAndSchool = useMemo(() => {
    const result = {};
    Object.entries(groupedReportsData).forEach(([course, items]) => {
      result[course] = groupBy(items, row => row.student?.school?.name || row.student?.campus?.location || 'Unknown');
    });
    return result;
  }, [groupedReportsData]);

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
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, {
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
    columnHelper.accessor(row => row.student?.course || "N/A", {
      header: "COURSE",
      id: "course",
      size: 80,
    }),
    columnHelper.accessor(row => `${row.student?.academicYear}` || "N/A", {
      header: "YEAR OF ENROLLMENT",
      id: "yearOfEnrollment",
      size: 120,
    }),
    columnHelper.accessor(row => row.student?.registrationNumber?.split('/')[3] || "N/A", {
      header: "BRANCH",
      id: "branch",
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
    "senate-approval": useReactTable({
      data: senateApprovalData,
      columns: getColumnsForTab("senate-approval"),
      getCoreRowModel: getCoreRowModel(),
    }),
    "reports": useReactTable({
      data: filteredData,
      columns: getColumnsForTab("reports"),
      getCoreRowModel: getCoreRowModel(),
    }),
  };

  const currentTable = tableInstances[activeTab];

  const handleExportAll = () => {
    // Excel export logic
    const headers = [
      "No", "NAME", "REG. NO", "GENDER", "COURSE", "YEAR OF ENROLLMENT", "BRANCH",
      "L.E. text (100%)", "L.E. text (20%)", "E.E. text (100%)", "E.E. text (40%)", "Total text mark (out of 60)",
      "L.E. viva (100%)", "L.E. viva (20%)", "E.E. viva (100%)", "E.E. viva (20%)", "Total viva mark (out of 40)",
      "Final Dissertation mark (out of 100)", "Status"
    ];

    let ws_data = [];
    ws_data.push(["UGANDA MANAGEMENT INSTITUTE"]);
    ws_data.push([`PROVISIONAL DISSERTATION EXAMINATION RESULTS FOR THE ACADEMIC YEAR ${currentAcademicYear || '_____/_____'}`]);
    ws_data.push([]);

    let rowIndex = 0;
    const formatInstructions = [];

    Object.entries(groupedByCourseAndSchool).forEach(([course, schools]) => {
      ws_data.push([`Course: ${course}`]);
      formatInstructions.push({ type: 'course', row: rowIndex });
      rowIndex++;
      Object.entries(schools).forEach(([school, items]) => {
        ws_data.push([`School: ${school}`]);
        formatInstructions.push({ type: 'school', row: rowIndex });
        rowIndex++;
        ws_data.push(headers);
        formatInstructions.push({ type: 'header', row: rowIndex });
        rowIndex++;
        items.forEach((book, index) => {
          const { textMarks, vivaMarks } = getStudentMarks(book);
          const regNo = book.student?.registrationNumber || "";
          const textTotal = (textMarks.internal * 0.2) + (textMarks.external * 0.4);
          const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
          const finalMark = textTotal + vivaTotal;
          ws_data.push([
            index + 1,
            `${book.student?.firstName || ""} ${book.student?.lastName || ""}`,
            regNo, book.student?.gender === "male" ? "M" : "F" || "N/A",
            book.student?.course || regNo.split('/')[2] || "N/A",
            book.student?.academicYear || `20${regNo.split('/')[0]}` || "N/A",
            regNo.split('/')[3] || "N/A",
            textMarks.internal.toFixed(0),
            (textMarks.internal * 0.2).toFixed(0),
            textMarks.external.toFixed(0),
            (textMarks.external * 0.4).toFixed(0),
            textTotal.toFixed(0),
            vivaMarks.internal.toFixed(0),
            (vivaMarks.internal * 0.2).toFixed(0),
            vivaMarks.external.toFixed(0),
            (vivaMarks.external * 0.2).toFixed(0),
            vivaTotal.toFixed(0),
            finalMark.toFixed(0),
            book.vivaHistory?.find(v => v.isCurrent)?.status || 'Complete'
          ]);
          formatInstructions.push({ type: 'row', row: rowIndex });
          rowIndex++;
        });
        ws_data.push([]);
        rowIndex++;
      });
      ws_data.push([]);
      rowIndex++;
    });

    formatInstructions.unshift({ type: 'title', row: 0 });
    formatInstructions.unshift({ type: 'subtitle', row: 1 });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
      { wch: 22 }, { wch: 14 }
    ];

    formatInstructions.forEach(({ type, row }) => {
      if (!ws_data[row]) return;
      const isHeader = type === 'header';
      const isTitle = type === 'title';
      const isSubtitle = type === 'subtitle';
      const isCourse = type === 'course';
      const isSchool = type === 'school';
      const isRow = type === 'row';
      for (let c = 0; c < ws_data[row].length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c });
        if (!ws[cellRef]) continue;
        if (isTitle) {
          ws[cellRef].s = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } };
        } else if (isSubtitle) {
          ws[cellRef].s = { font: { bold: true, sz: 13 }, alignment: { horizontal: 'center' } };
        } else if (isHeader) {
          ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }, alignment: { horizontal: 'center' } };
        } else if (isCourse || isSchool) {
          ws[cellRef].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'left' } };
        } else if (isRow) {
          ws[cellRef].s = { border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }, alignment: { horizontal: 'center' } };
        }
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `grade_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleExportAllTab = () => {
    let exportData = [];
    let columns = [];
    let sheetTitle = "";
    switch (activeTab) {
      case "results-sent":
        exportData = resultsSentData;
        columns = getColumnsForTab("results-sent").filter(col => col.id !== 'select');
        sheetTitle = "Results Sent to School";
        break;
      case "senate-approval":
        exportData = senateApprovalData;
        columns = getColumnsForTab("senate-approval");
        sheetTitle = "Results Approved by Senate";
        break;
      case "reports":
        handleExportAll();
        return;
      default:
        return;
    }
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
    const headers = ["No", "NAME", "REG. NO", "GENDER", "COURSE", "YEAR OF ENROLLMENT", "BRANCH", "Final mark", "Status"];
    const ws_data = [["UGANDA MANAGEMENT INSTITUTE"], [schoolName], [], headers];
    schoolData.forEach((book, index) => {
      const { textMarks, vivaMarks } = getStudentMarks(book);
      const finalMark = (textMarks.internal * 0.2) + (textMarks.external * 0.4) + (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
      ws_data.push([index + 1, `${book.student?.firstName} ${book.student?.lastName}`, book.student?.registrationNumber, book.student?.gender, book.student?.course, book.student?.academicYear, "", finalMark.toFixed(0), "Complete"]);
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
          {["results-sent", "senate-approval", "reports"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-xs font-medium rounded-lg capitalize ${activeTab === tab ? "bg-[#E8EAF6] text-[#23388F] border-2 border-[#23388F]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
            >
              {tab === "results-sent" ? "Results Sent to Schools" : tab.replace(/-/g, ' ')}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'reports' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="font-bold text-lg">UGANDA MANAGEMENT INSTITUTE</h1>
              <h2 className="font-semibold">PROVISIONAL DISSERTATION EXAMINATION RESULTS</h2>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleExportAllTab} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export All
              </Button>
            </div>
            {Object.entries(groupedByCourseAndSchool).map(([course, schools]) => (
              <div key={course} className="mb-8">
                <h3 className="text-lg font-bold mb-2">Course: {course}</h3>
                {Object.entries(schools).map(([school, items]) => (
                  <div key={school} className="mb-6">
                    <h4 className="text-base font-semibold mb-1">School: {school}</h4>
                    <GroupedReportTable items={items} reportsColumns={reportsColumns} TableComponent={TableComponent} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : activeTab === 'results-sent' ? (
          <div className="space-y-6">
            {Object.entries(groupedBySchoolForSentData).map(([schoolName, schoolData]) => (
              <SchoolTable key={schoolName} schoolName={schoolName} schoolData={schoolData} onExport={handleExportSchoolData} currentAcademicYear={currentAcademicYear} getColumnsForTab={getColumnsForTab} tab="results-sent" />
            ))}
          </div>
        ) : activeTab === 'senate-approval' ? (
          <TableComponent table={currentTable} />
        ) : null}
      </div>

      {/* Dialogs removed for Faculty Client */}
    </div>
  );
};

export default GradeManagementFinalSubmissionTable;
