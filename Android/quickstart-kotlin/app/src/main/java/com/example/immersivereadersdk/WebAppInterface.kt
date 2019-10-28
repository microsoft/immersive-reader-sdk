// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package com.example.immersivereadersdk

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.LinearLayout
import android.widget.Toast


class WebAppInterface(private val mContext: Context, var parentLayout: LinearLayout, var webView: WebView, var messageData: MainActivity.Message) {

    // Show a toast from html.
    @JavascriptInterface
    fun showToast(toast: String) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }

    // Exit the Immersive Reader.
    @JavascriptInterface
    fun immersiveReaderExit() {
        webView.post(Runnable { destroyWebView(parentLayout, webView) })
    }

    // Disposes of the WebView when the back arrow is tapped.
    private fun destroyWebView(parentLayout: LinearLayout, webView: WebView) {

        // Removes the WebView from its parent view before doing anything.
        parentLayout.removeView(webView)

        // Cleans things up before destroying the WebView.
        webView.clearHistory()
        webView.clearCache(true)
        webView.loadUrl("about:blank")
        webView.onPause()
        webView.removeAllViews()
        webView.pauseTimers()
        webView.destroy()

        // After the WebView is destroyed, do stuff.
        if (messageData.options.onExit != null) {
            val appUtilities = AppUtilities(mContext)
            appUtilities.exitCallback()
        }
    }
}