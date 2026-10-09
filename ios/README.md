# iPhone partner-status widget prototype

This is an experimental native companion to the existing MaBestie web app. It does **not** replace the Safari-installed app, and it is not published or ready to install on either phone yet.

The WidgetKit extension contains two read-only Home Screen widgets:

- **Julius status** — Rin adds this one to see Julius.
- **Rin status** — Julius adds this one to see Rin.

Each reads the latest partner profile from the same Supabase project as the web app and shows the selected pet's representative pixel frame, status, short message, and update time. It caches the last successful response locally in the extension. WidgetKit is asked to refresh after 15 minutes, but iOS controls the actual schedule; it is not live or continuously animated. Tapping opens the web app for edits.

## Build status

- `MaBestieWidgetExtension` compiles for generic iOS with Xcode 27.
- The containing `MaBestieWidgetHost` build currently fails at Xcode 27's `ValidateEmbeddedBinary` step with `Couldn't load Info dictionary` for the embedded `.appex`, even though the extension's processed `Info.plist` parses and the extension target builds independently. The same failure occurs with an XcodeGen-generated project. This must be resolved before device testing or installation.
- No iOS Simulator runtime or connected iPhone is available in the current development environment, so the small/medium layouts have not had visual device QA yet.

The extension-only verification command is:

```bash
xcodebuild -project ios/MaBestieWidget.xcodeproj \
  -target MaBestieWidgetExtension -configuration Debug -sdk iphoneos \
  SYMROOT=/tmp/mabestie-widget-build CODE_SIGNING_ALLOWED=NO build
```

The checked-in `.xcodeproj` is generated from `project.yml` with the free XcodeGen tool (`xcodegen generate --spec ios/project.yml --project ios`). XcodeGen is needed only when changing project settings, not to build the checked-in project.

The 14 static pet frames in `MaBestieWidget/Resources` are generated from the web atlases with `python3 ios/scripts/export_widget_frames.py`. This generation step requires Pillow; building the app does not.

## Cost and distribution boundary

An iOS widget must be inside a native app; adding the existing website to the Home Screen cannot install one. A free Apple Personal Team can test apps on a personal device through Xcode, but its provisioning profiles expire after seven days and require rebuilding/reinstalling. This is **not a sustainable two-person distribution method**. TestFlight and normal app distribution require Apple Developer Program membership. Do not promise a permanently installed widget under the current free-only constraint.

The prototype uses the same public Supabase publishable key and unauthenticated read policy as the web app. It adds no new access control; do not put sensitive status text in the database until two-person authentication and Row Level Security are implemented.

Apple references: [WidgetKit extension](https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension), [widget updates and animations](https://developer.apple.com/documentation/widgetkit/animating-data-updates-in-widgets-and-live-activities), [free Personal Team limits](https://developer.apple.com/help/account/basics/about-your-developer-account).
