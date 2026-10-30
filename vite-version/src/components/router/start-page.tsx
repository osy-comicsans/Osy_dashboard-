import { Navigate } from "react-router-dom"
import { readPreferences } from "@/features/account/storage"

export function StartPage() {
  return <Navigate to={readPreferences().startPage} replace />
}
