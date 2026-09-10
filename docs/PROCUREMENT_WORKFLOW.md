# Procurement Workflow

SchoolOS procurement now supports a controlled requisition lifecycle: purchase request creation, submission, approval/rejection, supplier quote capture and selection, purchase-order creation, PO state transitions, goods receipt validation, and inventory receipt posting.

All school-facing procurement queries validate that the requested school belongs to the authenticated organization. Vendor and quote operations are school-scoped. PO receipt quantities cannot exceed outstanding ordered quantities.

Recommended production extension: connect approved PO obligations to the accounting payable workflow and add configurable approval thresholds by amount/department.
