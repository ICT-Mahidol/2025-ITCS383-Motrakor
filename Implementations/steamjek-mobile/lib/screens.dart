import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'api_service.dart';
import 'theme.dart';

// --- Game Detail Screen ---
class GameDetailScreen extends StatefulWidget {
  final int gameId;
  const GameDetailScreen({super.key, required this.gameId});

  @override
  State<GameDetailScreen> createState() => _GameDetailScreenState();
}

class _GameDetailScreenState extends State<GameDetailScreen> {
  Map<String, dynamic>? _game;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchGame();
  }

  Future<void> _fetchGame() async {
    try {
      final res = await ApiService.getGameDetails(widget.gameId);
      if (mounted) {
        setState(() {
          _game = res['data'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_game == null) return const Scaffold(body: Center(child: Text('Game not found')));

    return Scaffold(
      appBar: AppBar(title: Text(_game!['title'] ?? 'Game Detail')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: SteamJekTheme.panel2,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.image, size: 64, color: SteamJekTheme.muted),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('\$${_game!['price']}', style: const TextStyle(color: SteamJekTheme.green, fontSize: 28, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: SteamJekTheme.accent2.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                  child: Text(_game!['genre'], style: const TextStyle(color: SteamJekTheme.accent2, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('ABOUT THIS GAME', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: SteamJekTheme.muted2)),
            const SizedBox(height: 8),
            Text(_game!['description'] ?? 'No description provided.', style: const TextStyle(fontSize: 16, height: 1.5)),
            const SizedBox(height: 48),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        await ApiService.addToCart(widget.gameId);
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to Cart', style: TextStyle(color: Colors.white))));
                      },
                      child: const Text('ADD TO CART'),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        await ApiService.addToWishlist(widget.gameId);
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to Wishlist', style: TextStyle(color: Colors.white))));
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: SteamJekTheme.panel2, foregroundColor: SteamJekTheme.text),
                      child: const Text('WISHLIST'),
                    ),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}

// --- Wishlist Screen ---
class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  List<dynamic> _wishlist = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchWishlist();
  }

  Future<void> _fetchWishlist() async {
    try {
      final res = await ApiService.getWishlist();
      if (mounted) {
        setState(() {
          _wishlist = res['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Wishlist')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _wishlist.isEmpty
              ? const Center(child: Text('Your wishlist is empty', style: TextStyle(color: SteamJekTheme.muted)))
              : ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: _wishlist.length,
                  itemBuilder: (context, index) {
                    final item = _wishlist[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: const Icon(Icons.favorite, color: SteamJekTheme.red),
                        title: Text(item['title'] ?? 'Game ${item['game_id']}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: SteamJekTheme.muted),
                          onPressed: () async {
                            await ApiService.removeFromWishlist(item['game_id']);
                            _fetchWishlist();
                          },
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => GameDetailScreen(gameId: item['game_id'])),
                          );
                        }
                      ),
                    );
                  },
                ),
    );
  }
}

// --- Marketplace Screen ---
class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  List<dynamic> _listings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchListings();
  }

  Future<void> _fetchListings() async {
    try {
      final res = await ApiService.getListings();
      if (mounted) {
        setState(() {
          _listings = res['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Marketplace')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _listings.isEmpty
              ? const Center(child: Text('No items listed in Community Market'))
              : ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: _listings.length,
                  itemBuilder: (context, index) {
                    final item = _listings[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: const Icon(Icons.category, color: SteamJekTheme.gold),
                        title: Text('Item type: ${item['item_type_id']} (Qty: ${item['quantity']})', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text('Seller ID: ${item['seller_id']}'),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('\$${item['price']}', style: const TextStyle(color: SteamJekTheme.green, fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(width: 16),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: SteamJekTheme.accent2),
                              onPressed: () async {
                                 await ApiService.buyMarketItem(item['id'], 1);
                                 _fetchListings();
                                 if (context.mounted) {
                                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purchased 1 item')));
                                 }
                              },
                              child: const Text('BUY'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
