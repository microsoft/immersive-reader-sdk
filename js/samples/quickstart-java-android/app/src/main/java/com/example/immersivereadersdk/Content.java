package com.example.immersivereadersdk;

import androidx.annotation.Keep;
import java.util.List;

@Keep
public class Content {

    public String title;
    public List<Chunk> chunks;

    public Content(String title, List<Chunk> chunks) {
        this.title = title;
        this.chunks = chunks;
    }

}
