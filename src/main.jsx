import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "@/components/ui/sonner"; 
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthContextProvider } from './store/context/AuthContext';

import { queryClient } from './utils/tanstack.ts';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
     <Toaster
        toastOptions={{
          success: {
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
        richColors
        position="top-center"
      />
    <QueryClientProvider client={queryClient}>
   
 
      <ReactQueryDevtools initialIsOpen={false} />
      <App />
   
    </QueryClientProvider>
   
  </>,
)
