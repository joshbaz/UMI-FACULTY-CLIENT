import { useQuery } from '@tanstack/react-query';
import { getAllStudents, getFacultyProfile, getStudent, getStudentStatuses, getStudentProposals, getProposal, getReviewersService, getPanelistsService, getSchoolProposals } from './api.js';

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

/* ********** END OF PANELIST MANAGEMENT ********** */