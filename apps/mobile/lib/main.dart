import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'features/auth/login_page.dart';

void main() {
  runApp(const SchoolOSApp());
}

class SchoolOSApp extends StatelessWidget {
  const SchoolOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SchoolOS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const LoginPage(),
    );
  }
}
