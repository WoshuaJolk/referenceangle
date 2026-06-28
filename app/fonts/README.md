# App font (PP Neue Montreal)

PP Neue Montreal is a commercial typeface (Pangram Pangram) and is not bundled
here. To use it, add the licensed web fonts to this folder, e.g.:

    app/fonts/PPNeueMontreal-Regular.woff2
    app/fonts/PPNeueMontreal-Medium.woff2
    app/fonts/PPNeueMontreal-Bold.woff2

Then swap the font loader in `app/layout.tsx` to a self-hosted one:

    import localFont from "next/font/local";

    const appSans = localFont({
      variable: "--font-app",
      src: [
        { path: "./fonts/PPNeueMontreal-Regular.woff2", weight: "400", style: "normal" },
        { path: "./fonts/PPNeueMontreal-Medium.woff2",  weight: "500", style: "normal" },
        { path: "./fonts/PPNeueMontreal-Bold.woff2",    weight: "700", style: "normal" },
      ],
    });

The CSS already routes everything through `--font-app` (see app/globals.css),
so no other change is needed. Until the files are added, the app uses Geist as a
close neo-grotesque stand-in.
