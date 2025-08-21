package com.example.tictactoe.repository;

import com.example.tictactoe.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByReceiver(String receiver);

    List<Notification> findBySenderAndStatus(String username,String status);

    List<Notification> findByReceiverAndGameId(String receiver, String gameId);

}
