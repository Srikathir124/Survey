package in.srikathiravan.survey;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebSettings settings = this.bridge.getWebView().getSettings();
            settings.setSupportZoom(true);
            settings.setBuiltInZoomControls(true);
            settings.setDisplayZoomControls(false);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
        }
        // Enable WebView debugging for Chrome DevTools
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        // Add JavaScript bridge for Android PrintManager
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void printPage(final String documentTitle) {
                    runOnUiThread(() -> {
                        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        if (printManager != null) {
                            String jobName = (documentTitle != null && !documentTitle.isEmpty())
                                    ? documentTitle
                                    : "Document";
                            PrintDocumentAdapter printAdapter = bridge.getWebView().createPrintDocumentAdapter(jobName);
                            printManager.print(jobName, printAdapter, new PrintAttributes.Builder().build());
                        }
                    });
                }
            }, "AndroidPrinter");
        }
    }
}