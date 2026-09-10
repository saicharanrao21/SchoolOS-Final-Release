# SchoolOS Digital Learning Architecture

The LMS extends the existing academics/homework domain without replacing existing assignments.

## Core capabilities
- Course catalogue scoped by organization and school
- Class, subject and academic-year mapping
- Ordered modules and lessons
- Rich lesson content and external/file resources
- Publication and availability windows
- Student course enrollment
- Lesson progress and resume position
- Completion events through the existing EventEmitter infrastructure
- Scheduled live classes with provider/meeting metadata
- Live-class attendance tracking
- Quizzes with question banks, scoring, attempts and pass thresholds
- Audit logging on learning-management mutations
- Permission gates: `lms.read`, `lms.manage`

## Security model
Every course, module, lesson, enrollment and live class lookup is anchored to the authenticated organization and school. Student progress and quiz attempts additionally validate that the student belongs to the requested school and organization. Client-provided organization identity is never accepted.

## Production integration points
Meeting providers, video storage, SCORM/LTI content, online proctoring and external conferencing APIs can be added behind the LMS resource/provider boundary without changing enrollment or progress records.
