Academic Scheduler

Project Vision: The Academic Scheduler streamlines timetable creation and
management for educational institutions, ensuring conflict-free schedules for
courses, instructors, and classrooms.

Four Components
Below are the four core components of the system, each with CRUD operations and a report generation feature:
1. Course Management
* Description: Manage all courses offered by the institution (e.g., "CS101: Intro to Programming").
* CRUD Operations:
    * Create: Add a new course.
    * Read: View all courses or filter by semester/instructor.
    * Update: Modify course details (e.g., change instructor).
    * Delete: Remove a course if it’s no longer offered.
* Report Generation: Generate a report listing all courses, their instructors, and schedules in a given semester (exportable to PDF/Excel).
2. Instructor Management
* Description: Manage instructor details and their availability.
* CRUD Operations:
    * Create: instructor can register to the system
    * Read: View all instructors or filter by department.
    * Update: instructors can Update availability by themselves
    * Delete: admin Remove an instructor (e.g., if they leave the institution).
* Report Generation: Generate a report showing each instructor’s timetable, workload (hours/week), and availability gaps.
3. Classroom Management
* Description: Manage classrooms and their schedules to avoid double-booking.
* CRUD Operations:
    * Create: Add a new classroom.
    * Read: View all classrooms or filter by availability/capacity.
    * Update: Update room details (e.g., add equipment).
    * Delete: Remove a classroom (e.g., if under renovation).
* Report Generation: Generate a report showing classroom utilization rates (e.g., % of time booked per week) and conflicts resolved.
4. Timetable Management
* Description: Core component that ties everything together to create and manage the conflict-free timetable.
* CRUD Operations:
    * Create: Generate a new timetable manually or automatically.
    * Read: View the timetable for a semester, filtered by course/instructor/room.
    * Update: Adjust schedules (e.g., change a time slot).
    * Delete: Discard a draft timetable.
* Report Generation: Generate a full timetable report showing all schedules, conflicts avoided, and gaps (exportable as a visual calendar or table)
- [ ] students can register to the system and view their timetables in their profiles
- [ ] instructors can view their timetables on their profiles
Special Feature: Smart Auto-Rescheduler with AI Conflict Resolver
This feature ensures minimal disruptions when unexpected changes occur (e.g., a teacher suddenly becomes unavailable).
🔹 How It Works:
1. If a teacher cancels a scheduled class, the system automatically finds another available teacher based on subject expertise.
2. If no teacher is available, it suggests time slot changes to avoid cancellation.
3. The system uses AI-driven recommendations to optimise the rescheduling process without affecting other classes.
