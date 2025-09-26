"use client";

import { conversationalScreening } from "@/ai/flows/conversational-screening";
import { getPersonalizedFeedback } from "@/ai/flows/personalized-feedback";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Logo } from "./logo";
import type { ConversationalScreeningInput } from "@/ai/flows/conversational-screening";

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
  const [screeningType, setScreeningType] = useState<keyof typeof screeningOptions | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const startScreening = async (type: keyof typeof screeningOptions) => {
    setScreeningType(type);
    setMessages([{ role: "assistant", content: `Okay, let's start the ${screeningOptions[type].name} screening. I'll ask a series of questions. Please respond honestly.` }]);
    setIsLoading(true);
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
        setMessages(prev => [...prev, { role: "assistant", content: response.summary || "Screening complete. Let me analyze your results..." }]);
        
        // Get personalized feedback
        const feedbackResponse = await getPersonalizedFeedback({
          screeningResults: response.summary || "No summary provided",
          conversationHistory: newHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n'),
        });
        
        const feedbackMessage = `${feedbackResponse.feedback}\n\n**Resource Recommendations:**\n${feedbackResponse.resourceRecommendations}`;
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
  }

  if (!screeningType) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Start a Confidential Screening</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-muted-foreground">Choose a screening to begin. Your conversation is private and secure.</p>
            {Object.keys(screeningOptions).map((key) => (
              <Button key={key} onClick={() => startScreening(key as keyof typeof screeningOptions)} size="lg">
                {screeningOptions[key as keyof typeof screeningOptions].name}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
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
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
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
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-xl px-4 py-3">
                    <LoadingIndicator />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        {isComplete ? (
            <div className="flex justify-center">
                <Button onClick={resetScreening}>Start New Screening</Button>
            </div>
        ) : currentQuestion && screeningType ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {screeningOptions[screeningType].responseOptions.map(opt => (
                    <Button key={opt} variant="outline" onClick={() => handleResponse(opt)}>
                        {opt}
                    </Button>
                ))}
            </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Please wait for the next question.
          </div>
        )}
      </div>
    </div>
  );
}
