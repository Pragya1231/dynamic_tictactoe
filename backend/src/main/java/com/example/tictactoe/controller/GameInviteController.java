//package com.example.tictactoe.controller;
//
//import com.example.tictactoe.entity.Notification;
//import com.example.tictactoe.repository.NotificationRepository;
//import com.example.tictactoe.request.InviteRequest;
//import com.example.tictactoe.response.InviteResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/invites")
//@CrossOrigin(origins = {
//    "http://localhost:3000",
//    "https://playspheregame.vercel.app/"
//})
//public class GameInviteController {
//
//    @Autowired
//    private NotificationRepository notificationRepository;
//
//    @PostMapping("/send")
//    public ResponseEntity<?> sendInvite(@RequestBody InviteRequest request) {
//        Notification notif = new Notification();
//        notif.setSender(request.getSender());
//        notif.setReceiver(request.getReceiver());
//        notif.setType("GAME_INVITE");
//        notif.setStatus("PENDING");
//        notif.setGameId(request.getGameId());
//        notif.setMessage(request.getSender() + " invited you to join Game #" + request.getGameId());
//        notificationRepository.save(notif);
//
//        return ResponseEntity.ok("Invite sent");
//    }
//
//    @PostMapping("/respond")
//    public ResponseEntity<?> respondToInvite(@RequestBody InviteResponse response) {
//        Notification notif = notificationRepository.findById(response.getNotifId())
//                .orElseThrow(() -> new RuntimeException("Invite not found"));
//
//        notif.setStatus(response.getAction().toUpperCase()); // ACCEPTED / IGNORED
//        notificationRepository.save(notif);
//
//        return ResponseEntity.ok("Response saved");
//    }
//}
//
//
//
//
//
