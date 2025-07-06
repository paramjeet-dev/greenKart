import express from 'express';
import Chat from '../models/Chats.js';
import Room from '../models/Rooms.js';
import mongoose from 'mongoose';

export const createRoom = async (req, res) => {
  const { ngo,user } = req.body;
  try {
    const room = new Room({ ngo,user });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
  }
}

export const getRoom = async (req, res) => {
  try {
    const { ngo } = req.params;
    const room = await Room.find({ ngo })
    res.status(200).json(room);
  }
  catch (error) {
    res.status(500).json({ message: 'Error fetching room', error });
  }
}

export const createMessage = async (req, res) => {
  const { room, sender, receiver, message } = req.body;
  try {
    const chat = new Chat({ room, sender, receiver, message });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating message', error });
  }
}

export const getMessages = async (req, res) => {
  const { room } = req.params;
  
  try {
    const messages = await Chat.find({ room });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
}

export const getUserMessages = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Chat.find({ receiver: userId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user messages', error });
  }
}
