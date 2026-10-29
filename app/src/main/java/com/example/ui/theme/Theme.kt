package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val SafeBanglaDarkColorScheme = darkColorScheme(
    primary = EmergencyRed,
    onPrimary = Color.White,
    primaryContainer = EmergencyRedDark,
    onPrimaryContainer = Color.White,
    secondary = SafetyTealLight,
    onSecondary = Color.Black,
    secondaryContainer = SafetyTeal,
    onSecondaryContainer = Color.White,
    tertiary = WarningYellow,
    onTertiary = Color.Black,
    background = SlateDark,
    onBackground = Color.White,
    surface = SlateSurface,
    onSurface = Color.White,
    surfaceVariant = SlateCard,
    onSurfaceVariant = SlateLight,
    outline = SlateBorder
)

private val SafeBanglaLightColorScheme = lightColorScheme(
    primary = EmergencyRedDark,
    onPrimary = Color.White,
    primaryContainer = EmergencyRed,
    onPrimaryContainer = Color.White,
    secondary = SafetyTeal,
    onSecondary = Color.White,
    secondaryContainer = SafetyTealLight,
    onSecondaryContainer = Color.Black,
    tertiary = HazardOrange,
    onTertiary = Color.White,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightCard,
    onSurfaceVariant = LightTextSecondary,
    outline = LightBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Default to high-contrast dark theme for emergency visibility
    dynamicColor: Boolean = false, // Keep consistent branding colors for emergency responder recognition
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> SafeBanglaDarkColorScheme
        else -> SafeBanglaLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
