# Enterprise Timetable Engine

SchoolOS timetable operations now enforce school ownership before mutating schedules and provide pre-publication readiness checks.

## Controls
- School/campus ownership validation for periods.
- Academic-year, class and section ownership validation for timetables.
- Teacher-to-subject/class/academic-year assignment validation.
- Teacher availability validation when availability rules exist.
- Room ownership validation.
- Draft writes validate every referenced period, subject, teacher and room before deleting existing draft entries.
- Slot-level conflict detection for teacher and room collisions across the school's academic-year timetables.
- Publish-readiness endpoint identifies section, teacher, room and availability issues.
- Timetable version cloning preserves a known-good schedule as a new draft.

## API
- `POST /academics/timetable-operations/validate-slot`
- `GET /academics/timetable-operations/versions/:versionId/readiness`
- `POST /academics/timetable-operations/versions/:versionId/clone`
