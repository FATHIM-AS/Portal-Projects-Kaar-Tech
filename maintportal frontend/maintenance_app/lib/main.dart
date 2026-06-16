import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Maintenance Portal',

      theme: ThemeData(
        primaryColor: Color(0xFF800000), // maroon
        scaffoldBackgroundColor: Color(0xFFF5F1E6), // beige
      ),

      home: LoginScreen(),
    );
  }
}