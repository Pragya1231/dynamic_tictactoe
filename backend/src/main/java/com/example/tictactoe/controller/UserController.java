package com.example.tictactoe.controller;

import com.example.tictactoe.entity.User;
import com.example.tictactoe.repository.UserRepository;
import com.example.tictactoe.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // adjust as needed
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest registerRequest){
        Map<String, Object> response = new HashMap<>();
        if(userRepository.existsByEmail(registerRequest.getEmail())){
            response.put("duplicate", false);
            response.put("message", "Email already exists");
        }else{
            User user =  new User();
            user.setEmail(registerRequest.getEmail());
            user.setUsername(registerRequest.getUsername());
            user.setPassword(registerRequest.getPassword());
            userRepository.save(user);
            response.put("success", true);
            response.put("username", registerRequest.getUsername());
        }
        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> loginOrRegister(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> response = new HashMap<>();

        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            if (Objects.equals(user.get().getPassword(), password)) {
                response.put("success", true);
                response.put("username", user.get().getUsername());
            } else {
                response.put("success", false);
                response.put("message", "Invalid password.");
            }
        } else {
            response.put("success", false);
            response.put("message", "user is not present !! Please Register First");
        }

        return response;
    }

    @PostMapping("/guest")
    public Map<String, Object> guestLogin() {
        Map<String, Object> response = new HashMap<>();

        String guestName;
        do {
            guestName = "guest" + new Random().nextInt(1000, 9999);
        } while (userRepository.existsByUsername(guestName));

        User guestUser = new User(guestName, null, true);
        userRepository.save(guestUser);

        response.put("success", true);
        response.put("username", guestName);
        return response;
    }
}

