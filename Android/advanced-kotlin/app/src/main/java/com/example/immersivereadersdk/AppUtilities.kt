package com.example.immersivereadersdk

import android.content.Context
import android.widget.Toast

// Shared stuff goes here.
class AppUtilities(private val mContext: Context) {

    // A parameterless function that onExit property is assigned.
    // This function is called by the destroyWebView function if assigned to the onExit option.
    fun exitCallback() {
        // TODO: Once the WebView is Destroyed, do something.
        Toast.makeText(mContext, "The Immersive Reader has been closed!", Toast.LENGTH_SHORT).show()
    }
}