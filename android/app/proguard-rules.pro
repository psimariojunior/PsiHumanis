# ProGuard rules for PsiHumanis

# Capacitor / WebView
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugins.** { *; }
-keep class com.psihumanis.app.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# Keep source file and line numbers for crash reports
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# R8 full mode optimizations
-allowaccessmodification
-optimizationpasses 5
-repackageclasses ''

# Stripe
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# LiveKit
-keep class io.livekit.** { *; }
-dontwarn io.livekit.**

# React Native / Hermes (if any)
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Prevent stripping of required classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}
