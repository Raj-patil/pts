<?php
// backend/get_users.php
require_once 'db_config.php';

$query = "SELECT id, name, email FROM users";
$stmt = $conn->prepare($query);
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
