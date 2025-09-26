"use client";

import { conversationalScreening } from "@/ai/flows/conversational-screening";
import { getPersonalizedFeedback } from "@/ai/flows/personalized-feedback";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, User, MessageSquarePlus, BookOpen, Users, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ConversationalScreeningInput } from "@/ai/flows/conversational-screening";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ConversationHistoryItem = {
    question: string;
    answer: string;
}

const screeningOptions = {
  "PHQ-9": { name: "Depression (PHQ-9)", responseOptions: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  "GAD-7": { name: "Anxiety (GAD-7)", responseOptions: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  "GHQ": { name: "General Well-being (GHQ)", responseOptions: ["Not at all", "Occasionally", "Quite often", "All the time"] },
};

const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-foreground rounded-full animate-bounce"></div>
    </div>
  );

export function ScreeningClient() {
  const router = useRouter();
  const [screeningType, setScreeningType] = useState<keyof typeof screeningOptions | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [chatMode, setChatMode] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!screeningType && !chatMode) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages([{ role: "assistant", content: "Hello! I'm WellConverse, your personal AI mental wellness companion. How are you feeling today?" }]);
        setIsLoading(false);
        setChatMode(true);
      }, 1000);
    }
  }, [screeningType, chatMode]);
  

  const startScreening = async (type: keyof typeof screeningOptions) => {
    setScreeningType(type);
    setMessages([{ role: "user", content: `I'd like to start the ${screeningOptions[type].name} screening.` }, { role: "assistant", content: `Okay, let's start the ${screeningOptions[type].name} screening. I'll ask a series of questions.` }]);
    setIsLoading(true);
    setChatMode(false); // Switch to guided response mode
    try {
      const input: ConversationalScreeningInput = { screeningType: type };
      const response = await conversationalScreening(input);
      if (response.nextQuestion) {
        setMessages(prev => [...prev, { role: "assistant", content: response.nextQuestion! }]);
        setCurrentQuestion(response.nextQuestion);
        setQuestionNumber(1);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeformResponse = async () => {
    if (inputValue.trim() === "") return;
    const answer = inputValue;
    setInputValue("");
    const newMessages: Message[] = [...messages, { role: "user", content: answer }];
    setMessages(newMessages);
    setIsLoading(true);

    if (answer.toLowerCase().includes('phq-9')) {
      startScreening('PHQ-9');
      return;
    }
    if (answer.toLowerCase().includes('gad-7')) {
        startScreening('GAD-7');
        return;
    }
    if (answer.toLowerCase().includes('ghq')) {
        startScreening('GHQ');
        return;
    }
    
    // Simple mock of chatbot deciding where to navigate
    if (answer.toLowerCase().includes('resources')) {
        router.push('/resources');
        return;
    }
    if (answer.toLowerCase().includes('counsellor')) {
        router.push('/counsellor');
        return;
    }
    if (answer.toLowerCase().includes('peer support')) {
        router.push('/peer-support');
        return;
    }

    setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: "I'm here to listen. You can tell me about what's on your mind, or you can start a formal screening like PHQ-9, GAD-7, or GHQ." }]);
        setIsLoading(false);
    }, 1500);

  }

  const handleResponse = async (answer: string) => {
    if (!screeningType || !currentQuestion) return;

    const newMessages: Message[] = [...messages, { role: "user", content: answer }];
    setMessages(newMessages);
    setIsLoading(true);
    setCurrentQuestion(null); // Disable buttons

    const newHistory: ConversationHistoryItem[] = [...conversationHistory, { question: currentQuestion, answer }];
    setConversationHistory(newHistory);

    try {
        const input: ConversationalScreeningInput = {
            screeningType,
            questionNumber,
            userAnswer: answer,
            conversationHistory: newHistory,
        };
      const response = await conversationalScreening(input);

      if (response.isComplete) {
        setIsComplete(true);
        setChatMode(true); // Switch back to chat mode
        setMessages(prev => [...prev, { role: "assistant", content: response.summary || "Screening complete. Let me analyze your results..." }]);
        
        const feedbackResponse = await getPersonalizedFeedback({
          screeningResults: response.summary || "No summary provided",
          conversationHistory: newHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n'),
        });
        
        const feedbackMessage = `${feedbackResponse.feedback}\n\n**Resource Recommendations:**\n${feedbackResponse.resourceRecommendations}\n\nWe can continue chatting, or I can guide you to other support systems. What feels right for you?`;
        setMessages(prev => [...prev, { role: "assistant", content: feedbackMessage }]);

      } else if (response.nextQuestion) {
        setMessages(prev => [...prev, { role: "assistant", content: response.nextQuestion! }]);
        setCurrentQuestion(response.nextQuestion);
        setQuestionNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScreening = () => {
    setScreeningType(null);
    setMessages([]);
    setConversationHistory([]);
    setIsLoading(false);
    setIsComplete(false);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setChatMode(false);
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot size={20} />
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot size={20} />
                </Avatar>
                <div className="bg-secondary rounded-xl px-4 py-3">
                    <LoadingIndicator />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        {chatMode ? (
          <div className="flex items-center gap-2">
            <Textarea 
              placeholder="Type your message..." 
              className="flex-1 resize-none" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFreeformResponse();
                }
              }}
            />
            <Button onClick={handleFreeformResponse} disabled={isLoading || inputValue.trim() === ""} size="icon">
              <Send />
            </Button>
          </div>
        ) : currentQuestion && screeningType ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {screeningOptions[screeningType].responseOptions.map(opt => (
                    <Button key={opt} variant="outline" onClick={() => handleResponse(opt)} disabled={isLoading}>
                        {opt}
                    </Button>
                ))}
            </div>
        ) : !isComplete && !isLoading ? (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => router.push('/resources')}><BookOpen className="mr-2"/> Resource Hub</Button>
                <Button variant="outline" onClick={() => router.push('/peer-support')}><Users className="mr-2"/> Peer Support</Button>
                <Button variant="outline" onClick={() => router.push('/counsellor')}><Briefcase className="mr-2"/> Find a Counsellor</Button>
            </div>
        ) : null
        }
        {isComplete &&
             <div className="mt-4 flex justify-center">
                <Button onClick={resetScreening}><MessageSquarePlus className="mr-2"/>Start New Conversation</Button>
            </div>
        }
      </div>
    </div>
  );
}
