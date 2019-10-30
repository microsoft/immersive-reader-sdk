package com.example.immersivereadersdk;

import androidx.annotation.Keep;

@Keep
public class Options {

    public String onExit;
    public String uiLang;
    public Integer timeout;

    public Options(String exitCallback, String uiLang, Integer timeout) {
        this.onExit = exitCallback;
        this.uiLang = uiLang;
        this.timeout = timeout;
    }
}
