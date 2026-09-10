import 'package:flutter_test/flutter_test.dart';
import 'package:schoolos_mobile/main.dart';

void main() {
  testWidgets('Login page smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const SchoolOSApp());

    // Verify that login page is shown
    expect(find.text('SchoolOS'), findsOneWidget);
    expect(find.text('Sign In'), findsOneWidget);
  });
}
