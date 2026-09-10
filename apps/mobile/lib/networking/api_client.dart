import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/environment_config.dart';

class ApiClient {
  final String baseUrl;
  String? _token;

  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? EnvironmentConfig.apiUrl;

  void updateToken(String token) {
    _token = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<http.Response> get(String path) async {
    return http.get(Uri.parse('$baseUrl$path'), headers: _headers);
  }

  Future<http.Response> post(String path, dynamic body) async {
    return http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
  }

  Future<http.Response> patch(String path, dynamic body) async {
    return http.patch(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
  }
}
