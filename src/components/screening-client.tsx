"use client";

import { conversationalScreening } from "@/ai/flows/conversational-screening";
import { getPersonalizedFeedback } from "@/ai/flows/personalized-feedback";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, User, Send, BookOpen, Users, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ConversationalScreeningInput } from "@/ai/flows/conversational-screening";
import { Textarea } from "./ui/textarea";
import Link from "next/link";

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
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
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
  const [inputValue, setInputValue] = useState("");
  const [lastScreeningDate, setLastScreeningDate] = useState<Date | null>(null);

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
    const storedDate = localStorage.getItem('lastScreeningDate');
    if (storedDate) {
      setLastScreeningDate(new Date(storedDate));
    }
  }, []);

  const shouldPromptForScreening = () => {
    if (!lastScreeningDate) { // First time user
      return true;
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return lastScreeningDate < oneWeekAgo;
  };
  
  useEffect(() => {
    if (messages.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        if (shouldPromptForScreening()) {
          setMessages([{ role: "assistant", content: "Hi, I’m here to listen and help. It looks like it's been a while. Would you like to take a quick wellbeing screening?" }]);
        } else {
          setMessages([{ role: "assistant", content: "Hello! I'm WellConverse, your personal AI mental wellness companion. How are you feeling today?" }]);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [lastScreeningDate]);
  
  const startScreening = async (type: keyof typeof screeningOptions) => {
    setIsLoading(true);
    setScreeningType(type);
    setMessages(prev => [...prev, { role: "user", content: `I'd like to start the ${screeningOptions[type].name} screening.` }, { role: "assistant", content: `Okay, let's start the ${screeningOptions[type].name} screening. I'll ask a series of questions.` }]);
    
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

    // AI will decide navigation
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
    setCurrentQuestion(null);

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
        const completionDate = new Date();
        localStorage.setItem('lastScreeningDate', completionDate.toISOString());
        setLastScreeningDate(completionDate);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] h-full w-full">
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <h1 className="text-xl font-bold font-headline">Conversation</h1>
            </header>
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        "flex items-start gap-4",
                        message.role === "user" ? "justify-end" : "justify-start"
                    )}
                    >
                    {message.role === "assistant" && (
                        <Avatar className="h-9 w-9 border-2 border-primary/50">
                            <AvatarFallback className="bg-primary/20 text-primary">
                                <Bot size={20} />
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                    >
                        {message.content}
                    </div>
                    {message.role === "user" && (
                        <Avatar className="h-9 w-9">
                        <AvatarFallback><User size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4 justify-start">
                        <Avatar className="h-9 w-9 border-2 border-primary/50">
                            <AvatarFallback className="bg-primary/20 text-primary">
                                <Bot size={20} />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary rounded-xl px-4 py-3 text-primary">
                            <LoadingIndicator />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-4 bg-background/95">
                {screeningType && currentQuestion ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {screeningOptions[screeningType].responseOptions.map(opt => (
                            <Button key={opt} variant="outline" onClick={() => handleResponse(opt)} disabled={isLoading}>
                                {opt}
                            </Button>
                        ))}
                    </div>
                ) : (
                <div className="relative">
                    <Textarea 
                    placeholder="Ask a question or make a request..." 
                    className="flex-1 resize-none pr-12" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleFreeformResponse();
                        }
                    }}
                    />
                    <Button onClick={handleFreeformResponse} disabled={isLoading || inputValue.trim() === ""} size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Send size={18} />
                    </Button>
                </div>
                )}
            </div>
        </div>
        <aside className="hidden md:flex flex-col border-l p-4 space-y-4">
            <h3 className="text-lg font-semibold">Suggested Actions</h3>
            <Button variant="outline" className="w-full justify-start" onClick={() => startScreening('PHQ-9')}>Start PHQ-9 Screening</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => startScreening('GAD-7')}>Start GAD-7 Screening</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => startScreening('GHQ')}>Start GHQ Screening</Button>
            
            <div className="!mt-8">
                <h3 className="text-lg font-semibold">Quick Links</h3>
            </div>
             <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                <Link href="/resources">
                    <BookOpen /> Resource Hub
                </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                <Link href="/peer-support">
                    <Users /> Peer Support
                </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                <Link href="/counsellor">
                    <Briefcase /> Find a Counsellor
                </Link>
            </Button>
        </aside>
    </div>
  );
}
