package com.decifra.app;

import android.os.Bundle;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

/**
 * MainActivity que estende LauncherActivity do Google Android Browser Helper.
 * Isso garante que o app abra como uma Trusted Web Activity (TWA).
 */
public class MainActivity extends LauncherActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Customizações podem ser feitas aqui se necessário
    }
}
