/* The tile that stands in for a course — a stack of blocks tinted with the
   course accent. Rendered inline (not an asset) so the colour follows the
   course definition and it stays crisp at any size. */
export default function CourseIcon({ courseId, size = 56 }) {
  return (
    <span className="course-icon" data-course={courseId} style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true">
        <rect x="8" y="32" width="22" height="11" rx="2.5" className="ci-b1" />
        <rect x="17" y="22.5" width="22" height="11" rx="2.5" className="ci-b2" />
        <rect x="26" y="13" width="22" height="11" rx="2.5" className="ci-b3" />
      </svg>
    </span>
  );
}
