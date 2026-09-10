class ChildModel {
  final String id;
  final String admissionNumber;
  final String firstName;
  final String lastName;
  final String? profilePhoto;
  final String className;
  final String sectionName;

  ChildModel({
    required this.id,
    required this.admissionNumber,
    required this.firstName,
    required this.lastName,
    this.profilePhoto,
    required this.className,
    required this.sectionName,
  });

  factory ChildModel.fromJson(Map<String, dynamic> json) {
    final enrollment = json['currentEnrollment'];
    return ChildModel(
      id: json['id'],
      admissionNumber: json['admissionNumber'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      profilePhoto: json['profilePhoto'],
      className: enrollment?['class']?['name'] ?? 'N/A',
      sectionName: enrollment?['section']?['name'] ?? 'N/A',
    );
  }
}
