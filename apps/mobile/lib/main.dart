import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Definición de las rutas con GoRouter
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const CalmHomeScreen(),
    ),
    GoRoute(
      path: '/details',
      builder: (context, state) => const CalmDetailsScreen(),
    ),
  ],
);

void main() {
  runApp(
    // Envolver la app en ProviderScope para habilitar Riverpod
    const ProviderScope(
      child: CommitmentApp(),
    ),
  );
}

class CommitmentApp extends StatelessWidget {
  const CommitmentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Commitment',
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
      // Implementación del Diseño Calmo y Material 3
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2C5E54), // Verde calma natural
          brightness: Brightness.light,
          primary: const Color(0xFF2C5E54),
          surface: const Color(0xFFF9FBF9), // Blanco roto verdoso calmo
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FBF9),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w300,
            letterSpacing: -0.5,
            color: Color(0xFF1C2C26),
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: Color(0xFF2C3E37),
          ),
        ),
      ),
    );
  }
}

class CalmHomeScreen extends StatelessWidget {
  const CalmHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Commitment',
                style: Theme.of(context).textTheme.displayLarge,
              ),
              const SizedBox(height: 16),
              const Text(
                '"Frameworks are replaceable. Business rules are not."',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Color(0xFF5C6E66),
                ),
              ),
              const Spacer(),
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2C5E54).withOpacity(0.08),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.spa_outlined,
                        size: 48,
                        color: Color(0xFF2C5E54),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Un espacio para la resiliencia.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () => context.push('/details'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF2C5E54), width: 1.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Entrar al Presente',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF2C5E54),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CalmDetailsScreen extends StatelessWidget {
  const CalmDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'El Presente',
          style: TextStyle(fontWeight: FontWeight.w300),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: const Padding(
        padding: EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enfoque de Hoy',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w300),
            ),
            SizedBox(height: 16),
            Text(
              'No se muestra más de 3 microacciones para proteger tu foco y evitar la parálisis.',
              style: TextStyle(color: Color(0xFF5C6E66)),
            ),
          ],
        ),
      ),
    );
  }
}
