import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import FormErrorHandler from "../../../components/FormErrorHandler/FormErrorHandler";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";

const EditSupervisorPersonalInfoForm = ({
  supervisorData,
  updateSupervisorMutation,
}) => {
  const initialValues = {
    ...supervisorData,
    facultyType: supervisorData.facultyType || "",
    name: supervisorData.name || "",
    workEmail: supervisorData.workEmail || "",
    personalEmail: supervisorData.personalEmail || "",
    primaryPhone: supervisorData.primaryPhone || "",
    secondaryPhone: supervisorData.secondaryPhone || "",
    title: supervisorData.title || "",
  };

  const validationSchema = yup.object().shape({
    facultyType: yup.string().required("Faculty type is required"),
    name: yup.string().required("Full name is required"),
    workEmail: yup
      .string()
      .email("Invalid email")
      .required("Work email is required"),
    personalEmail: yup.string().email("Invalid email"),
    primaryPhone: yup.string().required("Primary phone number is required"),
    secondaryPhone: yup.string(),
    title: yup.string().required("Title is required"),
  });
  return (
    <Formik
     
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Encrypt data before storing
        updateSupervisorMutation.mutate(values);
      }}
    >
      {({ values, handleChange, errors, touched }) => (
        <Form>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
            <button
              disabled={updateSupervisorMutation.isPending}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 ${
                updateSupervisorMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiOutlineDocumentDuplicate className="w-4 h-4 mr-2" />
              {updateSupervisorMutation.isPending ? "Saving..." : "Save Details"}
            </button>
          </div>
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Faculty Type
            </label>
            <select
              name="facultyType"
              value={values.facultyType}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.facultyType && touched.facultyType ? "border-red-500" : "border-gray-300"
              } p-2`}
            >
              <option value="">Select faculty type</option>
              
              <option  value="supervisor">Supervisor</option>
            </select>
            <FormErrorHandler
              errors={errors?.facultyType}
              message={errors?.facultyType}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <select
                name="title"
                value={values.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title && touched.title ? "border-red-500" : "border-gray-300"
                } p-2`}
              >
                <option value="">Select title</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
              <FormErrorHandler
                errors={errors?.title}
                message={errors?.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border capitalize ${
                  errors.name && touched.name
                    ? "border-red-500"
                    : "border-gray-300"
                } p-2`}
              />
              <FormErrorHandler errors={errors?.name} message={errors?.name} />
            </div>
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Work Email Address
                </label>
                <input
                  type="email"
                  name="workEmail"
                  value={values.workEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.workEmail && touched.workEmail
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                />
                <FormErrorHandler
                  errors={errors?.workEmail}
                  message={errors?.workEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Personal Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={values.personalEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.personalEmail && touched.personalEmail
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                />
                <FormErrorHandler
                  errors={errors?.personalEmail}
                  message={errors?.personalEmail}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  name="primaryPhone"
                  value={values.primaryPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.primaryPhone && touched.primaryPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                />
                <FormErrorHandler
                  errors={errors?.primaryPhone}
                  message={errors?.primaryPhone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secondary Phone Number (Optional)
                </label>
                <input
                  type="text"
                  name="secondaryPhone"
                  value={values.secondaryPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.secondaryPhone && touched.secondaryPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                />
                <FormErrorHandler
                  errors={errors?.secondaryPhone}
                  message={errors?.secondaryPhone}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default EditSupervisorPersonalInfoForm