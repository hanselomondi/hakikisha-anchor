import { redirect } from "next/navigation"

// Redirect from /admin to /admin/login
const AdminPage = () => {
  redirect("/admin/login")
}

export default AdminPage;