package com.fenixit.online_editor_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@RestController
public class OnlineEditorApiApplication {

    private static final String path = "/tmp/";
    private static final Logger LOGGER = LoggerFactory.getLogger(OnlineEditorApiApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(OnlineEditorApiApplication.class, args);
    }

    @GetMapping(value = "/hello", produces = "application/json")
    public Map<String, String> sayHello(@RequestParam(value = "myName", defaultValue = "World") String name) {
        return Collections.singletonMap("text", String.format("Hello %s", name));
    }

    @PostMapping(value = "/generateUUID", produces = "application/json")
    public Map<String, String> generateUUId() {
        UUID uuid = UUID.randomUUID();
        LOGGER.info(String.format("Генерируем uuid: %s", uuid.toString()));
        return Collections.singletonMap("uuid", uuid.toString());
    }

    @PostMapping(value = "/saveCode", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> saveCode(@RequestBody Map<String, String> request) {

        try {
            String uuid = request.get("uuid");
            String txt = request.get("code");

            Path path = Paths.get(OnlineEditorApiApplication.path).resolve(uuid);
            File f = new File(path.toAbsolutePath().toString());

            if (Files.notExists(path))
                f.createNewFile();

            BufferedWriter writer = new BufferedWriter(new FileWriter(f));
            writer.write(txt);
            writer.close();

        } catch (Exception e) {
            return new ResponseEntity<>(String.format("{\"status\": \"false\", " +
                    "\"message\": \"%s\"}", e.getMessage()),
                    HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>("{\"status\": \"true\", \"message\": ''}", HttpStatus.OK);
    }

    @PostMapping(value = "/getCode", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> getCode(@RequestBody Map<String, String> request) {

        String result;

        try {
            String uuid = request.get("uuid");

            Path path = Paths.get(OnlineEditorApiApplication.path).resolve(uuid);

            if (Files.notExists(path))
                return new ResponseEntity<>("{\"status\": \"true\", " +
                        "\"message\": \"\"}",
                        HttpStatus.OK);

            result = Files.readString(path);

        } catch (Exception e) {
            return new ResponseEntity<>(String.format("{\"status\": \"false\", " +
                    "\"message\": \"%s\"}", e.getMessage()),
                    HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(String.format("{\"status\": \"true\", \"message\": \"%s\"}", result), HttpStatus.OK);
    }
}
