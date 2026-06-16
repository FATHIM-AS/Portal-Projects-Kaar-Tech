import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'notification_detail_screen.dart';
import 'workorder_detail_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  List plants = [];
  List notifications = [];
  List workorders = [];

  String selectedPlant = "0001";
  String selectedPriority = "ALL";
  String selectedStatus = "ALL";

  // Work order filters
  String selectedWoStatus = "ALL";
  String selectedWoOrderType = "ALL";

  late TabController _tabController;

  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    fetchAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> fetchAllData() async {
    setState(() => isLoading = true);
    var plantData = await ApiService.getPlants(selectedPlant);
    var notifData = await ApiService.getNotifications(selectedPlant);
    var workData = await ApiService.getWorkOrders(selectedPlant);
    setState(() {
      plants = plantData['d']?['results'] ?? [];
      notifications = notifData['d']?['results'] ?? [];
      workorders = workData['d']?['results'] ?? [];
      isLoading = false;
    });
  }

  bool isOpen(Map n) {
    try {
      String sapDate = n['Strmn'] ?? "";
      int timestamp = int.parse(sapDate.replaceAll(RegExp(r'[^0-9]'), ''));
      DateTime date = DateTime.fromMillisecondsSinceEpoch(timestamp);
      return date.isAfter(DateTime.now());
    } catch (e) {
      return true;
    }
  }

  List get filteredNotifications {
    List temp = notifications;
    if (selectedPriority != "ALL") {
      temp = temp.where((n) => n['Priok'] == selectedPriority).toList();
    }
    if (selectedStatus == "OPEN") {
      temp = temp.where((n) => isOpen(n)).toList();
    } else if (selectedStatus == "CLOSED") {
      temp = temp.where((n) => !isOpen(n)).toList();
    }
    return temp;
  }

  /// A work order is considered "Open" when its system status (Sstat) does NOT
  /// contain "TECO" (Technically Completed) or "CLSD" (Closed).
  bool isWorkOrderOpen(Map w) {
    final status = (w['Sstat'] ?? '').toString().toUpperCase();
    return !status.contains('TECO') && !status.contains('CLSD');
  }

  List get filteredWorkOrders {
    List temp = workorders;
    if (selectedWoStatus == "OPEN") {
      temp = temp.where((w) => isWorkOrderOpen(w)).toList();
    } else if (selectedWoStatus == "CLOSED") {
      temp = temp.where((w) => !isWorkOrderOpen(w)).toList();
    }
    if (selectedWoOrderType != "ALL") {
      temp = temp.where((w) => (w['Auart'] ?? '') == selectedWoOrderType).toList();
    }
    return temp;
  }

  /// Collect distinct order types from the loaded work orders.
  List<String> get availableOrderTypes {
    final types = workorders
        .map((w) => (w['Auart'] ?? '').toString())
        .where((t) => t.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
    return ['ALL', ...types];
  }

  void logout() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF800000).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.logout_rounded,
                    color: Color(0xFF800000), size: 28),
              ),
              const SizedBox(height: 16),
              const Text(
                "Sign Out",
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2C1A1A)),
              ),
              const SizedBox(height: 8),
              const Text(
                "Are you sure you want to sign out?",
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF8A7070), fontSize: 14),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF4A3030),
                        side: const BorderSide(color: Color(0xFFE0D0C8)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text("Cancel",
                          style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF800000),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                          (route) => false,
                        );
                      },
                      child: const Text("Sign Out",
                          style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F1E6),
      body: Column(
        children: [
          _buildHeader(),
          _buildTabBar(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildNotificationsTab(),
                _buildWorkOrdersTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF800000),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        "Maintenance Portal",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        "Dashboard",
                        style: TextStyle(
                          color: Colors.white60,
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: logout,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.logout_rounded,
                          color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Plant Dropdown
              if (plants.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: plants.any((p) => p['Werks'] == selectedPlant)
                          ? selectedPlant
                          : plants.first['Werks'],
                      isExpanded: true,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded,
                          color: Color(0xFF800000)),
                      style: const TextStyle(
                        color: Color(0xFF2C1A1A),
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                      items: plants.map<DropdownMenuItem<String>>((p) {
                        return DropdownMenuItem(
                          value: p['Werks'],
                          child: Row(
                            children: [
                              const Icon(Icons.factory_outlined,
                                  color: Color(0xFF800000), size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  "${p['Name1']} (${p['Werks']})",
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        if (value == null) return;
                        setState(() => selectedPlant = value);
                        fetchAllData();
                      },
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            color: const Color(0xFF800000),
            borderRadius: BorderRadius.circular(12),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          indicatorPadding: const EdgeInsets.all(4),
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF8A7070),
          labelStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.notifications_outlined, size: 18),
                  const SizedBox(width: 6),
                  const Text("Notifications"),
                  if (notifications.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _buildBadge(filteredNotifications.length),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.assignment_outlined, size: 18),
                  const SizedBox(width: 6),
                  const Text("Work Orders"),
                  if (workorders.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _buildBadge(filteredWorkOrders.length),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(int count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        '$count',
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _buildNotificationsTab() {
    return Column(
      children: [
        _buildNotificationFilters(),
        Expanded(
          child: isLoading
              ? _buildLoader()
              : filteredNotifications.isEmpty
                  ? _buildEmpty("No notifications found", Icons.notifications_off_outlined)
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                      itemCount: filteredNotifications.length,
                      itemBuilder: (context, i) =>
                          _notificationCard(filteredNotifications[i]),
                    ),
        ),
      ],
    );
  }

  Widget _buildWorkOrdersTab() {
    return Column(
      children: [
        _buildWorkOrderFilters(),
        Expanded(
          child: isLoading
              ? _buildLoader()
              : filteredWorkOrders.isEmpty
                  ? _buildEmpty(
                      "No work orders found", Icons.assignment_late_outlined)
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                      itemCount: filteredWorkOrders.length,
                      itemBuilder: (context, i) =>
                          _workOrderCard(filteredWorkOrders[i]),
                    ),
        ),
      ],
    );
  }

  Widget _buildWorkOrderFilters() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Row(
        children: [
          Expanded(
            child: _filterChipGroup(
              label: "Status",
              options: const ["ALL", "OPEN", "CLOSED"],
              selected: selectedWoStatus,
              onChanged: (v) => setState(() => selectedWoStatus = v),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _filterChipGroup(
              label: "Order Type",
              options: availableOrderTypes,
              selected: selectedWoOrderType,
              onChanged: (v) => setState(() => selectedWoOrderType = v),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationFilters() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Row(
        children: [
          Expanded(
            child: _filterChipGroup(
              label: "Status",
              options: const ["ALL", "OPEN", "CLOSED"],
              selected: selectedStatus,
              onChanged: (v) => setState(() => selectedStatus = v),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _filterChipGroup(
              label: "Priority",
              options: const ["ALL", "1", "2", "3"],
              selected: selectedPriority,
              onChanged: (v) => setState(() => selectedPriority = v),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChipGroup({
    required String label,
    required List<String> options,
    required String selected,
    required ValueChanged<String> onChanged,
  }) {
    // Ensure the current value is always in the options list to avoid
    // a Flutter assertion error (value not in items).
    final safeOptions =
        options.contains(selected) ? options : ['ALL', ...options];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          // value must exactly match one of the DropdownMenuItem values
          value: selected,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded,
              color: Color(0xFF800000), size: 18),
          style: const TextStyle(
            color: Color(0xFF2C1A1A),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
          items: safeOptions.map((e) {
            // Display text is human-friendly; stored value stays as raw e.g. "ALL"
            final displayText = e == "ALL" ? "$label: All" : e;
            return DropdownMenuItem<String>(
              value: e,
              child: Text(
                displayText,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF2C1A1A),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) onChanged(val);
          },
        ),
      ),
    );
  }

  Widget _notificationCard(Map n) {
    bool open = isOpen(n);
    Color priorityColor = _priorityColor(n['Priok']);

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => NotificationDetailScreen(notification: n),
        ),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Priority indicator
              Container(
                width: 4,
                height: 54,
                decoration: BoxDecoration(
                  color: priorityColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 14),
              // Icon circle
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: priorityColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.notification_important_outlined,
                    color: priorityColor, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      n['Qmtxt'] ?? "—",
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: Color(0xFF2C1A1A),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _tag("P${n['Priok'] ?? '?'}", priorityColor),
                        const SizedBox(width: 6),
                        _tag(
                          open ? "Open" : "Closed",
                          open ? const Color(0xFF2E7D32) : const Color(0xFF6D4C41),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded,
                  color: Color(0xFFBBA8A8), size: 22),
            ],
          ),
        ),
      ),
    );
  }

  Widget _workOrderCard(Map w) {
    final bool open = isWorkOrderOpen(w);
    final String orderType = (w['Auart'] ?? '').toString();

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => WorkOrderDetailScreen(workorder: w),
        ),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 54,
                decoration: BoxDecoration(
                  color: open
                      ? const Color(0xFF2E7D32)
                      : const Color(0xFF6D4C41),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 14),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF800000).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.assignment_outlined,
                    color: Color(0xFF800000), size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      w['Ktext'] ?? "—",
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: Color(0xFF2C1A1A),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Order #${w['Aufnr'] ?? '—'}",
                      style: const TextStyle(
                        color: Color(0xFF8A7070),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _tag(
                          open ? "Open" : "Closed",
                          open
                              ? const Color(0xFF2E7D32)
                              : const Color(0xFF6D4C41),
                        ),
                        if (orderType.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          _tag(orderType, const Color(0xFF800000)),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded,
                  color: Color(0xFFBBA8A8), size: 22),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildLoader() {
    return const Center(
      child: CircularProgressIndicator(
        color: Color(0xFF800000),
        strokeWidth: 2.5,
      ),
    );
  }

  Widget _buildEmpty(String text, IconData icon) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 56, color: const Color(0xFFCCBBAA)),
          const SizedBox(height: 12),
          Text(
            text,
            style: const TextStyle(
              color: Color(0xFF8A7070),
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Color _priorityColor(dynamic priority) {
    switch (priority?.toString()) {
      case "1":
        return const Color(0xFFC62828);
      case "2":
        return const Color(0xFFF57C00);
      case "3":
        return const Color(0xFF1565C0);
      default:
        return const Color(0xFF800000);
    }
  }
}