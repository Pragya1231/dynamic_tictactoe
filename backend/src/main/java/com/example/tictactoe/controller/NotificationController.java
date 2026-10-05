package com.example.tictactoe.controller;

import com.example.tictactoe.entity.Notification;
import com.example.tictactoe.entity.User;
import com.example.tictactoe.repository.NotificationRepository;
import com.example.tictactoe.repository.PlayerRepository;
import com.example.tictactoe.repository.UserRepository;
import com.example.tictactoe.request.InviteRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://playspheregame.vercel.app/"
})
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private UserRepository userRepository;

    // Send friend request
    @PostMapping("/send/{sender}/{receiver}")
    public ResponseEntity<?> sendRequest(@PathVariable String sender, @PathVariable String receiver) {
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setMessage(sender + " wants to add you as friend.");
        notification.setStatus("PENDING");
        notification.setType("FRIEND_REQUEST");

        notificationRepo.save(notification);
        return ResponseEntity.ok("Friend request sent.");
    }

//    @GetMapping("/outgoing/{username}")
//    public List<Notification> findOutgoingBySender(@PathVariable String username){
//        return
//    }

    // Get notifications for a user
    @GetMapping("/{username}")
    public List<Notification> getNotifications(@PathVariable String username) {
        return notificationRepo.findByReceiver(username);
    }

    // Accept request
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable String id) {
        Notification notif = notificationRepo.findById(id).orElseThrow();
        notif.setStatus("ACCEPTED");
        notificationRepo.save(notif);

        // Add both users as friends
        Optional<User> sender = userRepository.findByUsername(notif.getSender());

        Optional<User> receiver = userRepository.findByUsername(notif.getReceiver());
        if(sender.isPresent() && receiver.isPresent()){
            sender.get().getFriends().add(receiver.get().getUsername());
            receiver.get().getFriends().add(sender.get().getUsername());
            userRepository.save(sender.get());
            userRepository.save(receiver.get());
        }

        return ResponseEntity.ok("Friend request accepted.");
    }

    // Ignore request
    @PostMapping("/{id}/ignore")
    public ResponseEntity<?> ignoreRequest(@PathVariable String id) {
        Notification notif = notificationRepo.findById(id).orElseThrow();
        notif.setStatus("IGNORED");
        notificationRepo.save(notif);

        // Create reverse notification for sender
        Notification back = new Notification();
        back.setSender(notif.getReceiver());
        back.setReceiver(notif.getSender());
        back.setMessage(notif.getReceiver() + " ignored your friend request.");
        back.setStatus("IGNORED");
        notificationRepo.save(back);

        return ResponseEntity.ok("Friend request ignored.");
    }
    @GetMapping("/outgoing/{username}")
    public List<Notification> getOutgoingRequests(@PathVariable String username) {
        return notificationRepo.findBySenderAndStatus(username, "PENDING");
    }

    @PostMapping("/invite")
    public ResponseEntity<?> sendInvite(@RequestBody InviteRequest request) {
        List<Notification> invites = notificationRepo.findByReceiverAndGameId(request.getReceiver(), request.getBoardId());
        if(invites!=null){
            for (Notification invite : invites) {
                if(invite.getSender().equals(request.getSender()) && invite.getStatus().equals("PENDING")){
                    return null;
                }
            }
        }
        Notification notif = new Notification();
        notif.setSender(request.getSender());
        notif.setReceiver(request.getReceiver());
        notif.setType("GAME_INVITE");
        notif.setStatus("PENDING");
        notif.setGameId(request.getBoardId());
        notif.setMessage(request.getSender() + " invited you to join Game #" + request.getBoardId());
        notificationRepo.save(notif);

        return ResponseEntity.ok("Invite sent");
    }

}

