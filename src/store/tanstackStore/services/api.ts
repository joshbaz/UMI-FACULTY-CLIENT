import axios from "axios"
import apiRequest, { BASE_API_URL } from "../../../utils/apiRequestUrl.js"


/* ********** ERROR HANDLING ********** */  

const errorHandling = (error: any) => {
    if (error?.response) {
        throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
    } else if (error.request) {
        throw {message: "No response from server. Please check your network connection."}
    } else {
        throw {message: `Request failed: ${error.message}`}
    }
}

/* ********** AUTH ********** */

export const loginFaculty = async (user: any) => {
    try {
        const response = await apiRequest.post("/faculty/login", user)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getFacultyProfile = async () => {
    try {
        const response = await apiRequest.get("/faculty/profile")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

// export const requestPasswordReset = async (email: string) => {
//     try {
//         const response = await apiRequest.post("/faculty/request-password-reset", { email })
//         return response.data
//     } catch (error) {
//         errorHandling(error)
//     }
// }

export const updateFacultyProfile = async (user: any) => {
    try {
        const response = await apiRequest.put("/faculty/profile", user)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const updateFacultyPassword = async (password: any) => {
    try {
        const response = await apiRequest.put("/faculty/password", password)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}



/* ********** STUDENT MANAGEMENT ********** */

export const getAllStudents = async () => {
    try {
        const response = await apiRequest.get("/faculty/students")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getStudent = async (studentId: string) => {
    try {   
        const response = await apiRequest.get(`/faculty/students/${studentId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}   

export const getStudentStatuses = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/students/${studentId}/statuses`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** END OF STUDENT MANAGEMENT ********** */

/* ********** PROPOSAL MANAGEMENT ********** */

export const submitProposalService = async (studentId: string, proposal: any) => {
    try {
        const token = localStorage.getItem('umi_auth_token')
        const response = await apiRequest.post(`/faculty/proposals/${studentId}`, proposal,{
            headers: {
                'Content-Type': 'multipart/form-data',
               
            }
        })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const gradeProposal = async (studentId: string, proposalId: string, grade: number, feedback: string) => {
    try {
        const response = await apiRequest.post(`/faculty/proposals/${studentId}/${proposalId}/grade`, { grade, feedback })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getStudentProposals = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/proposals/${studentId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getSchoolProposals = async () => {
    try {
        const response = await apiRequest.get("/faculty/proposals")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getProposal = async (proposalId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/proposal/${proposalId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const addDefenseDateService = async (proposalId: string, defenseDate: string, type: string) => {
    try {
        const response = await apiRequest.post(`/faculty/proposals/${proposalId}/defense-date`, { defenseDate, type })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const addComplianceReportDateService = async (proposalId: string, complianceReportDate: string) => {
    try {
        const response = await apiRequest.post(`/faculty/proposals/${proposalId}/compliance-report-date`, { complianceReportDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const generateDefenseReportService = async (proposalId: string, reportData: FormData) => {
  try {
    const response = await apiRequest.post(`/faculty/generate-defense-report/${proposalId}`, reportData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}

export const getProposalDefenseReportsService = async (proposalId: string) => {
    try {
    const response = await apiRequest.get(`/faculty/proposal/${proposalId}/defense-reports`);
    return response.data;
    } catch (error) {
    errorHandling(error);
    }
}



export const downloadProposalDefenseReportService = async (reportId) => {
    try {
      const response = await apiRequest.get(
        `/faculty/defense-reports/${reportId}/download`,
        {
          responseType: 'blob', // Important: This tells axios to expect binary data
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }; 



/* ********** END OF PROPOSAL MANAGEMENT ********** */

/* ********** REVIEWER MANAGEMENT ********** */
export const addReviewersService = async (proposalId: string, reviewers: any) => {
    try {
        const response = await apiRequest.post(`/faculty/reviewers/${proposalId}`, { reviewers })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getReviewersService = async () => {
    try {
        const response = await apiRequest.get("/faculty/reviewers")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const deleteReviewerService = async (proposalId: string, reviewerId: string) => {
    try {
        const response = await apiRequest.delete(`/faculty/reviewers/${proposalId}/${reviewerId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const addNewPanelistService = async (data: any) => {
    try {
        const response = await apiRequest.post('/faculty/panelists', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}



/* ********** END OF REVIEWER MANAGEMENT ********** */

/* ********** PANELIST MANAGEMENT ********** */

export const addPanelistsService = async (proposalId: string, panelists: any) => {
    try {
        const response = await apiRequest.post(`/faculty/panelists/${proposalId}`, { panelists })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getPanelistsService = async () => {
    try {   
        const response = await apiRequest.get("/faculty/panelists")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}   


export const deletePanelistService = async (proposalId: string, panelistId: string) => {
    try {
        const response = await apiRequest.delete(`/faculty/panelists/${proposalId}/${panelistId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** END OF PANELIST MANAGEMENT ********** */

/* ********** REVIEWER MARK MANAGEMENT ********** */

export const addReviewerMarkService = async (proposalId: string, reviewerId: string, verdict: string, feedback: string) => {
    try {
        const response = await apiRequest.post(`/faculty/reviewer-marks/${proposalId}/${reviewerId}`, { verdict, feedback })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}   

/* ********** PANELIST MARK MANAGEMENT ********** */

export const addPanelistMarkService = async (proposalId: string, panelistId: string, grade: number, feedback: string) => {
    try {
        const response = await apiRequest.post(`/faculty/panelist-marks/${proposalId}/${panelistId}`, { grade, feedback })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** END OF REVIEWER MARK MANAGEMENT ********** */

/* ********** FIELD LETTER MANAGEMENT ********** */

export const generateFieldLetterService = async (proposalId: string, formData: FormData) => {
    try {
        const response = await apiRequest.post(`/faculty/generate-field-letter/${proposalId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateFieldLetterDateService = async (proposalId: string, fieldLetterDate: string) => {
    try {
        const response = await apiRequest.put(`/faculty/update-field-letter-date/${proposalId}`, { fieldLetterDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const updateEthicsCommitteeDateService = async (proposalId: string, ethicsCommitteeDate: string) => {
    try {
        const response = await apiRequest.put(`/faculty/update-ethics-committee-date/${proposalId}`, { ethicsCommitteeDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}
/* ********** END OF FIELD LETTER MANAGEMENT ********** */

/* ********** EXAMINER MANAGEMENT ********** */



export const getAllExaminersService = async () => {
    try {
        const response = await apiRequest.get('/faculty/examiners');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getExaminerService = async (examinerId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/examiners/${examinerId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateExaminerService = async (examinerId: string, examinerData: any) => {
    try {
        const response = await apiRequest.put(`/faculty/examiners/${examinerId}`, examinerData);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const deleteExaminerService = async (examinerId: string) => {
    try {
        const response = await apiRequest.delete(`/faculty/examiners/${examinerId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** EXAMINER ASSIGNMENT MANAGEMENT ********** */

export const assignExaminersToBookService = async (bookId: string, staffMemberIds: string[]) => {
    try {
        const response = await apiRequest.post(`/faculty/books/${bookId}/examiners`, { staffMemberIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateInternalExaminerMarkService = async (assignmentId: string, mark: number, comments: string) => {
    try {
        const response = await apiRequest.put(`/faculty/internal-examiner-mark/${assignmentId}`, {
            mark,
            comments
        });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}



/* ********** END OF EXAMINER MANAGEMENT ********** */

/* ********** BOOK MANAGEMENT ********** */

export const getAllBooksService = async () => {
  try {
    const response = await apiRequest.get('/faculty/books');
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}

export const getBookService = async (bookId: string) => {
  try {
    const response = await apiRequest.get(`/faculty/books/${bookId}`);
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}

export const getStudentBooksService = async (studentId: string) => {
  try {
    const response = await apiRequest.get(`/faculty/student-books/${studentId}`);
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}

/** Chairperson */
export const getChairpersonsService = async () => {
  try {
    const response = await apiRequest.get('/faculty/chairperson');
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}

export const createChairpersonService = async (name: string, email: string) => {
  try {
    const response = await apiRequest.post('/faculty/chairperson', {
      name,
      email
    });
    return response.data;
  } catch (error) {
    errorHandling(error);
  }
}






/* ********** END OF BOOK MANAGEMENT ********** */

/* ********** DASHBOARD MANAGEMENT ********** */

export const getDashboardStatsService = async () => {
    try {
        const response = await apiRequest.get('/faculty/dashboard/stats');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getStatusStatisticsService = async (category?: string) => {
    try {
        console.log("category", category);
        const url = category 
            ? `/faculty/dashboard/status-statistics?category=${category}` 
            : '/faculty/dashboard/status-statistics';
        const response = await apiRequest.get(url);
        return response.data;
    } catch (error) {
        errorHandling(error);
        throw error;
    }
}

export const getProgressTrendsService = async (timeRange: string) => {
    try {
        const response = await apiRequest.get(`/faculty/dashboard/progress-trends?timeRange=${timeRange}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


/* ********** END OF DASHBOARD MANAGEMENT ********** */

/* ********** NOTIFICATION MANAGEMENT ********** */

export const getNotificationsService = async () => {
    try {
        const response = await apiRequest.get('/faculty/notifications');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


/* ********** PROPOSAL DEFENSE MANAGEMENT ********** */
 // Start of Selection
export const scheduleProposalDefenseService = async (
  proposalId: string,
  scheduledDate: string,
  details: {
    location: string;
    chairpersonId: string;
    minutesSecretaryId: string;
    panelistIds: string[];
    reviewerIds: string[];
  }
) => {
  try {
    const payload = {
      scheduledDate,
      ...details,
    };
    const response = await apiRequest.post(
      `/faculty/proposals/${proposalId}/defenses`,
      payload
    );
    return response.data;
  } catch (error) {
    errorHandling(error);
    throw error;
  }
};

export const recordProposalDefenseVerdictService = async (defenseId: string, verdict: string, comments: string) => {
    try {
        const response = await apiRequest.put(`/faculty/defenses/${defenseId}`, { verdict, comments });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getProposalDefensesService = async () => {
    try {
        const response = await apiRequest.get('/faculty/defenses');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF PROPOSAL DEFENSE MANAGEMENT ********** */

export const getAllSupervisorsService = async () => {
    try {
        const response = await apiRequest.get('/faculty/supervisors');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/* ********** EXTERNAL PERSONS MANAGEMENT ********** */

export const getExternalPersonsService = async () => {
    try {
        const response = await apiRequest.get('/faculty/external-persons');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getExternalPersonsByRoleService = async (role: string) => {
    try {
        const response = await apiRequest.get(`/faculty/external-persons/${role}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const createExternalPersonService = async (name: string, email: string, role: string) => {
    try {
        const response = await apiRequest.post('/faculty/external-person', { name, email, role });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateExternalPersonService = async (id: string, data: { name?: string, email?: string, role?: string, isActive?: boolean }) => {
    try {
        const response = await apiRequest.put(`/faculty/external-person/${id}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const deleteExternalPersonService = async (id: string) => {
    try {
        const response = await apiRequest.delete(`/faculty/external-person/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF EXTERNAL PERSONS MANAGEMENT ********** */

/** ********** FACULTY MANAGEMENT ********** */
export const getAllFacultyService = async () => {
    try {
        const response = await apiRequest.get('/faculty/faculty');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllCampusesService = async () => {
    try {
        const response = await apiRequest.get("/faculty/campuses");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllDepartmentsService = async (schoolId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/schools/${schoolId}/departments`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllSchoolsService = async () => {
    try {
        const response = await apiRequest.get("/faculty/schools");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/* ********** SUPERVISOR ********** */
export const createSupervisorService = async (data: any) => {
    try {
        const response = await apiRequest.post('/faculty/supervisor', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAssignedStudentsService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/supervisor/${supervisorId}/students`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteSupervisorService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.delete(`/faculty/supervisor/${supervisorId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateSupervisorService = async (supervisorId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/faculty/supervisor/${supervisorId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getSupervisorService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.get(`/faculty/supervisor/${supervisorId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const assignStudentsToSupervisorService = async (supervisorId: string, studentIds: string[]) => {
    try {
        const response = await apiRequest.post(`/faculty/supervisor/${supervisorId}/assign-students`, { studentIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const changeStudentSupervisorService = async (studentId: string, data: { oldSupervisorId: string, newSupervisorId: string, reason: string }) => {
    try {
        const response = await apiRequest.put(`/faculty/students/${studentId}/change-supervisor`, data)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** STAFF MEMBERS ********** */

export const getStaffMembersService = async () => {
    try {
        const response = await apiRequest.get("/faculty/staff")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const createStaffMemberService = async (staffData: any) => {
    try {
        const response = await apiRequest.post("/faculty/staff", staffData);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const convertStaffToReviewerService = async (staffMemberId: string) => {
    try {
        const response = await apiRequest.post(`/faculty/staff/${staffMemberId}/convert-to-reviewer`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const createReviewerFromStaffService = async (staffMemberId: string) => {
    try {
        const response = await apiRequest.post(`/faculty/staff/${staffMemberId}/convert-to-reviewer`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const createPanelistFromStaffService = async (staffMemberId: string) => {
    try {
        const response = await apiRequest.post(`/faculty/staff/${staffMemberId}/convert-to-panelist`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};