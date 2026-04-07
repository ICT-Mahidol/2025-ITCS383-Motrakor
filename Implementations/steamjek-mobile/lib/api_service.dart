import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator testing against local backend
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  static Future<Map<String, String>> getHeaders([bool auth = false]) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  // --- Auth ---
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await getHeaders(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await getHeaders(),
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  // --- Games ---
  static Future<Map<String, dynamic>> getGames() async {
    final response = await http.get(Uri.parse('$baseUrl/games'));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getGameDetails(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/games/$id'));
    return jsonDecode(response.body);
  }

  // --- Cart ---
  static Future<Map<String, dynamic>> getCart() async {
    final response = await http.get(Uri.parse('$baseUrl/cart'), headers: await getHeaders(true));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> addToCart(int gameId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/cart'),
      headers: await getHeaders(true),
      body: jsonEncode({'gameId': gameId}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> removeFromCart(int gameId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/cart/$gameId'),
      headers: await getHeaders(true),
    );
    return jsonDecode(response.body);
  }

  // --- Purchases ---
  static Future<Map<String, dynamic>> getLibrary() async {
    final response = await http.get(Uri.parse('$baseUrl/purchases'), headers: await getHeaders(true));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> createPaymentIntent() async {
    final response = await http.post(
      Uri.parse('$baseUrl/purchases/create-payment-intent'),
      headers: await getHeaders(true),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> confirmPayment(String paymentIntentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/purchases/confirm'),
      headers: await getHeaders(true),
      body: jsonEncode({'paymentIntentId': paymentIntentId}),
    );
    return jsonDecode(response.body);
  }

  // --- Wishlist ---
  static Future<Map<String, dynamic>> getWishlist() async {
    final response = await http.get(Uri.parse('$baseUrl/wishlist'), headers: await getHeaders(true));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> addToWishlist(int gameId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wishlist'),
      headers: await getHeaders(true),
      body: jsonEncode({'gameId': gameId}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> removeFromWishlist(int gameId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/wishlist/$gameId'),
      headers: await getHeaders(true),
    );
    return jsonDecode(response.body);
  }

  // --- Marketplace ---
  static Future<Map<String, dynamic>> getListings() async {
    final response = await http.get(Uri.parse('$baseUrl/market/listings'), headers: await getHeaders(true));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getMyItems() async {
    final response = await http.get(Uri.parse('$baseUrl/market/my-items'), headers: await getHeaders(true));
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> listMarketItem(int itemTypeId, int quantity, double price) async {
    final response = await http.post(
      Uri.parse('$baseUrl/market/listings'),
      headers: await getHeaders(true),
      body: jsonEncode({'itemTypeId': itemTypeId, 'quantity': quantity, 'price': price}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> buyMarketItem(int listingId, int quantity) async {
    final response = await http.post(
      Uri.parse('$baseUrl/market/buy/$listingId'),
      headers: await getHeaders(true),
      body: jsonEncode({'quantity': quantity}),
    );
    return jsonDecode(response.body);
  }
}
