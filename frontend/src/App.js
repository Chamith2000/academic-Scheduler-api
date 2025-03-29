import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import Home from "./components/Home";
import Instructor from "./pages/instructors/Instructor";
import Room from "./pages/rooms/Room";
import TimeSlot from "./components/TimeSlot";
import Programme from "./components/Programme";
import Course from "./pages/courses/Course";
import Faculty from "./components/Faculty";
import Department from "./components/Department";
import Section from "./pages/section/Section";
import InstructorPreference from "./pages/instructors/InstructorPreference";
import InstructorTimetable from "./pages/instructors/InstructorTimetable";
import Layout from "./Layout/Layout";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import LandingPage from "./pages/landing-page/LandingPage";
import Unauthorized from "./pages/unauthorized/Unauthorized";
import StudentTimetable from "./pages/students/StudentTimetable";
import InstructorDashboardPage from "./components/InstructorDashboard"
import InstructorPreferencesPage from "./components/InstructorPreferences";
import InstructorCourses from "./pages/instructors/InstructorCourses";


const ROLES = {
  student: "STUDENT",
  instructor: "INSTRUCTOR",
  admin: "ADMIN",
};

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="landingpage" element={<LandingPage />} />
          <Route path="unauthorized" element={<Unauthorized />} />

          {/* protect these routes */}
          <Route
              element={
                <RequireAuth
                    allowedRoles={[ROLES.student, ROLES.instructor, ROLES.admin]}
                />
              }
          >
            <Route path="/" element={<Home />} />
          </Route>

          <Route
              element={<RequireAuth allowedRoles={[ROLES.instructor, ROLES.admin]} />}
          >
            <Route path="instructor" element={<Instructor />} />
            <Route path="instructor-timetable" element={<InstructorTimetable />} />
            <Route path="instructor-dashboard" element={<InstructorDashboardPage />} />
            <Route path="instructor-preferences" element={<InstructorPreferencesPage />} />
            <Route path="instructor-courses" element={<InstructorCourses />} />
          </Route>

          <Route
              element={<RequireAuth allowedRoles={[ROLES.student]} />}
          >
            <Route path="student-timetable" element={<StudentTimetable />} />
            <Route
                path="instructor-preference"
                element={<InstructorPreference />}
            />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
            <Route path="room" element={<Room />} />
            <Route path="timeslot" element={<TimeSlot />} />
            <Route path="programme" element={<Programme />} />
            <Route path="course" element={<Course />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="department" element={<Department />} />
            <Route path="section" element={<Section />} />

          </Route>
          end of protected routes
        </Route>
      </Routes>
  );
}

export default App;
