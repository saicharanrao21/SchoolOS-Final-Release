# Student Life — Behavior, Discipline & Wellbeing

The Student Life module provides a school-scoped lifecycle for behavioral incidents, intervention actions, positive recognition points and counseling sessions.

## Controls
- Organization and school ownership is validated server-side.
- Student ownership is validated through the school and organization relationship.
- Dedicated `student_life.read` and `student_life.manage` permissions are required.
- Behavior changes and recognition awards are audit logged.
- Incident reports emit `student.behavior.incident_reported` for existing communications/realtime consumers.

## Lifecycle
Incident: OPEN → UNDER_REVIEW → RESOLVED → CLOSED.

Actions can be assigned with due dates and tracked independently. Points support both positive and corrective entries. Counseling sessions can remain open through a scheduled follow-up.
