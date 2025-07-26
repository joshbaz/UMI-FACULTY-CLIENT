import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllStudents, getFacultyProfile, getStudent, getStudentStatuses, getStudentProposals, getProposal, getReviewersService, getPanelistsService, getSchoolProposals, getAllExaminersService, getExaminerService, getBookService, getStudentBooksService, getAllBooksService, getProgressTrendsService, getStatusStatisticsService, getDashboardStatsService, getNotificationsService, getProposalDefensesService, getAllSupervisorsService, getChairpersonsService, getExternalPersonsService, getExternalPersonsByRoleService, getProposalDefenseReportsService, getAllFacultyService, getAllCampusesService, getAllDepartmentsService, getAllSchoolsService, getAssignedStudentsService, getSupervisorService, getStaffMembersService, createStaffMemberService } from './api.js';
import { queryClient } from '@/utils/tanstack';

// Common options for most queries
function getDefaultQueryOptions() {
  return {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    refetchInterval: false,
    networkMode: 'online',
  };
}

export function useGetFacultyProfile() {
  return useQuery({
    queryKey: ['facultyProfile'],
    queryFn: getFacultyProfile,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** STUDENT MANAGEMENT ********** */

export function useGetAllStudents() {
  return useQuery({
    queryKey: ['allStudents'],
    queryFn: getAllStudents,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

export function useGetStudent(studentId: string) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId),
    enabled: Boolean(studentId), // Only run if studentId exists
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

export function useGetStudentStatuses(studentId: string) {
  return useQuery({
    queryKey: ['studentStatuses', studentId],
    queryFn: () => getStudentStatuses(studentId),
    enabled: Boolean(studentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF STUDENT MANAGEMENT ********** */

/* ********** PROPOSAL MANAGEMENT ********** */

export function useGetStudentProposals(studentId: string) {
  return useQuery({
    queryKey: ['studentProposals', studentId],
    queryFn: () => getStudentProposals(studentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

export function useGetProposal(proposalId: string) {
  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => getProposal(proposalId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

export function useGetSchoolProposals() {
  return useQuery({
    queryKey: ['schoolProposals'],
    queryFn: getSchoolProposals,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF PROPOSAL MANAGEMENT ********** */  

/* ********** REVIEWER MANAGEMENT ********** */

export function useGetReviewers() {
  return useQuery({
    queryKey: ['reviewers'],
    queryFn: getReviewersService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF REVIEWER MANAGEMENT ********** */

/* ********** PANELIST MANAGEMENT ********** */

export function useGetPanelists() {
  return useQuery({
    queryKey: ['panelists'],
    queryFn: getPanelistsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}


/* ********** CHAIRPERSON MANAGEMENT ********** */

export function useGetChairpersons() {
  return useQuery({
    queryKey: ['chairpersons'],
    queryFn: getChairpersonsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF CHAIRPERSON MANAGEMENT ********** */




/* ********** END OF PANELIST MANAGEMENT ********** */


/* ********** EXAMINER MANAGEMENT ********** */
export function useGetAllExaminers() {
  return useQuery({
    queryKey: ['examiners'],
    queryFn: getAllExaminersService,
    staleTime: Infinity,
    refetchInterval: false,
    networkMode: 'online',  
  });
}

export function useGetExaminer(examinerId: string) {
  return useQuery({
    queryKey: ['examiner', examinerId],
    queryFn: () => getExaminerService(examinerId),
    staleTime: Infinity,
    refetchInterval: false,
    networkMode: 'online',
    enabled: !!examinerId,
  });
}

export function useGetAllBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: getAllBooksService,
    staleTime: Infinity,
    refetchInterval: false,
    networkMode: 'online',
  });
}

export function useGetBook(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getBookService(bookId),
    staleTime: Infinity,
    refetchInterval: false,
    networkMode: 'online',
    enabled: !!bookId,
  });
}

export function useGetStudentBooks(studentId: string) {
  return useQuery({
    queryKey: ['studentBooks', studentId],
    queryFn: () => getStudentBooksService(studentId),
    staleTime: Infinity,
    refetchInterval: false,
    networkMode: 'online',
    enabled: !!studentId,
  });
}

/* ********** DASHBOARD MANAGEMENT ********** */

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStatsService,
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

export const useGetStatusStatistics = (category?: string) => {
  return useQuery({
    queryKey: ['statusStatistics', category],
    queryFn: () => getStatusStatisticsService(category),
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

export const useGetProgressTrends = (timeRange: string) => {
  return useQuery({
    queryKey: ['progressTrends', timeRange],
    queryFn: () => getProgressTrendsService(timeRange),
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};
/* ********** END OF DASHBOARD MANAGEMENT ********** */
/* ********** NOTIFICATION MANAGEMENT ********** */

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsService,
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

/* ********** PROPOSAL DEFENSE MANAGEMENT ********** */

export const useGetProposalDefenses = () => {
  return useQuery({
    queryKey: ['proposalDefenses'],
    queryFn: getProposalDefensesService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetProposalDefenseReports = (proposalId: string) => {
  return useQuery({
    queryKey: ['proposalDefenseReports', proposalId],
    queryFn: () => getProposalDefenseReportsService(proposalId),
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
}; 

export const downloadProposalDefenseReport = (reportId: string) => {
  return useQuery({
    queryKey: ['downloadProposalDefenseReport', reportId],
    queryFn: () => getProposalDefenseReportsService(reportId),
    enabled: Boolean(reportId), // Only run if reportId exists
    staleTime: Infinity, // 1 minute
    refetchInterval: false, 
    retry: 1,
  });
};
/* ********** END OF PROPOSAL DEFENSE MANAGEMENT ********** */

/* ********** SUPERVISOR ********** */
export const useGetAllSupervisors = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: getAllSupervisorsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

/* ********** CHAIRPERSON MANAGEMENT ********** */


/* ********** EXTERNAL PERSONS MANAGEMENT ********** */
export const useGetExternalPersons = () => {
  return useQuery({
    queryKey: ['externalPersons'],
    queryFn: getExternalPersonsService,
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

export const useGetExternalPersonsByRole = (role: string) => {
  return useQuery({
    queryKey: ['externalPersons', role],
    queryFn: () => getExternalPersonsByRoleService(role),
    enabled: Boolean(role), // Only run if role exists
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

/* ********** FACULTY ********** */
export const useGetAllFaculty = () => {
  return useQuery({
    queryKey: ['faculty'],
    queryFn: getAllFacultyService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};


export const useGetAllCampuses = () => {
  return useQuery({
    queryKey: ['campuses'],
    queryFn: getAllCampusesService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

/* ********** DEPARTMENTS ********** */
export const useGetAllDepartments = (schoolId: string) => {
  return useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => getAllDepartmentsService(schoolId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!schoolId
  });
};

/* ********** SCHOOLS ********** */
export const useGetAllSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: getAllSchoolsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetAssignedStudents = (supervisorId: string) => {
  return useQuery({
    queryKey: ['assignedStudents', supervisorId],
    queryFn: () => getAssignedStudentsService(supervisorId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!supervisorId
  });
};

export const useGetSupervisor = (id: string) => {
  return useQuery({
    queryKey: ['supervisor', id],
    queryFn: () => getSupervisorService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

/* ********** STAFF MEMBERS ********** */

export const useGetStaffMembers = () => {
  return useQuery({
    queryKey: ['staffMembers'],
    queryFn: getStaffMembersService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
};

export const useCreateStaffMember = () => {
  return useMutation({
    mutationFn: async (staffData: any) => {
      const response = await createStaffMemberService(staffData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
    },
  });
};