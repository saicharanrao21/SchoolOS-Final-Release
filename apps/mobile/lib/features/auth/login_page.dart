import 'package:flutter/material.dart';
import 'package:schoolos_mobile/networking/api_client.dart';
import '../../theme/app_theme.dart';
import '../shell/role_shells.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(Icons.shield_rounded, size: 48, color: Colors.white),
              ),
              const SizedBox(height: 24),
              const Text(
                'SchoolOS',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.navyColor,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Identity & Access Management',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black54,
                ),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'name@school.com',
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _passwordController,
                obscureText: !_isPasswordVisible,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: '••••••••',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                      color: Colors.black38,
                    ),
                    onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text('Forgot Password?'),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  final client = ApiClient();
                  if (_emailController.text.contains('parent')) {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ParentShell(apiClient: client)));
                  } else if (_emailController.text.contains('teacher')) {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TeacherShell(apiClient: client)));
                  } else if (_emailController.text.contains('driver')) {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TransportOperatorShell(apiClient: client)));
                  } else if (_emailController.text.contains('student')) {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => StudentShell(apiClient: client)));
                  } else {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ParentShell(apiClient: client)));
                  }
                },
                child: const Text('Sign In'),
              ),
              const SizedBox(height: 40),
              const Text(
                'Authorized Personnel Only',
                style: TextStyle(fontSize: 12, color: Colors.black26),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
