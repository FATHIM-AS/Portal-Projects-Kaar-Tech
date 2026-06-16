import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://localhost:3000/api";

  static Future<Map<String, dynamic>> login(
    String pernr,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse("$baseUrl/login"),
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "pernr": pernr,
        "password": password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    throw Exception(response.body);
  }

  static Future<Map<String, dynamic>> getPlants(String werks) async {
    final response = await http.get(
      Uri.parse("$baseUrl/plants?werks=$werks"),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    throw Exception(response.body);
  }

  static Future<Map<String, dynamic>> getNotifications(String iwerk) async {
    final response = await http.get(
      Uri.parse("$baseUrl/notifications?iwerk=$iwerk"),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    throw Exception(response.body);
  }

  static Future<Map<String, dynamic>> getWorkOrders(String werks) async {
    final response = await http.get(
      Uri.parse("$baseUrl/workorders?werks=$werks"),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    throw Exception(response.body);
  }
}