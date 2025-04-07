import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "../../assets/logo1.png";
import { toast } from "sonner";
import { format } from "date-fns";
import { useFormik } from "formik";
import * as yup from "yup";
import { AuthContext } from "../../store/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { loginFaculty } from "../../store/tanstackStore/services/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {updateUser} = useContext(AuthContext)

  const facultyMutation = useMutation({
    mutationFn: loginFaculty,
    onSuccess: (data) => {
      updateUser({
        token: data.token
      });
      toast.success("Login successful", {
        duration: 3000,
        description: format(new Date(), "MMM d, yyyy h:mm a"),
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: Infinity,
        description: format(new Date(), "MMM d, yyyy h:mm a"),
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email('Invalid email address')
        .required('Email is required'),
      password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      await facultyMutation.mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      });
    }
  });
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="UMI Logo" className="mx-auto h-32" />
        </div>

        <div className="bg-white py-8 px-10 shadow rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-8">Login</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  School Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full font-[Inter-Regular] !text-gray-700 bg-transparent text-base p-2 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200 focus:ring-1 focus:ring-primary-500'} rounded focus:outline-none  `}
                  placeholder="your.email@umi.ac.ug"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-sm text-[#B91C1C]">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full font-[Inter-Regular] shadow-none text-base p-2 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200 focus:ring-1 focus:ring-primary-500'} rounded focus:outline-none  `}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-sm text-[#B91C1C]">{formik.errors.password}</p>
                )}
                {error && <p className="mt-2 text-sm text-[#B91C1C]">{error}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                    className="h-4 w-4 border-gray-300 rounded checked:bg-[#CA922D]"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <div>
                  <Link
                    to="/request-password-reset"
                    className="text-sm font-medium text-primary-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#27357E] text-white rounded-md py-2 text-sm font-medium hover:bg-[#1f2861] transition-colors mt-6 flex items-center justify-center gap-2"
                disabled={facultyMutation.isPending}
              >
                {facultyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Sign In'
                )
              }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login