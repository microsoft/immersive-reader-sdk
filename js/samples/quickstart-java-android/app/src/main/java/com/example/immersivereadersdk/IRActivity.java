package com.example.immersivereadersdk;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatActivity;

public class IRActivity extends AppCompatActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.getSupportActionBar().hide();
        setContentView(R.layout.activity_immersive_reader);
        final WebView webView = findViewById(R.id.webView);

        // Create an Immersive Reader launcher instance and launch it.
        IRLauncher immersiveReaderLauncher = new IRLauncher(IRActivity.this, webView);
        immersiveReaderLauncher.launch(new IRLauncher.IRLaunchListener() {
            @Override
            public void onSuccess() {
                //Log telemetry
            }

            @Override
            public void onFailure(IRError error) {
                finishImmersiveReader(error);
            }

            @Override
            public void onExit() {
                finishImmersiveReader(new IRError(Error.NONE, "Immersive reader screen exited by user"));
            }
        });
    }

    private void finishImmersiveReader(IRError error) {
        Bundle bundle = new Bundle();
        bundle.putParcelable(IRStore.Output.ERROR, error);
        getIntent().putExtras(bundle);
        finish();
    }
}
