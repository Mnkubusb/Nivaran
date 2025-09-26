"use client";

import { conversationalScreening } from "@/ai/flows/conversational-screening";
import { getPersonalizedFeedback } from "@/ai/flows/personalized-feedback";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, User, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ConversationalScreeningInput } from "@/ai/flows/conversational-screening";
import { Textarea } from "./ui/textarea";
import { Logo } from "./logo";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import type { Components } from "react-markdown";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";


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

const SuggestedAction = ({ href, text }: { href: string, text: string }) => (
    <Button asChild variant="outline" className="mt-2">
        <Link href={href}>{text}</Link>
    </Button>
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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const storedDate = localStorage.getItem('lastScreeningDate');
    if (storedDate) {
      setLastScreeningDate(new Date(storedDate));
    } else {
      setLastScreeningDate(null); // Explicitly set to null if not found
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
    if (messages.length === 0 && lastScreeningDate !== undefined) {
      setIsLoading(true);
      setTimeout(() => {
        if (shouldPromptForScreening()) {
          setMessages([{ role: "assistant", content: "Hi, I’m here to listen and help. It looks like it's been a while. Would you like to take a quick wellbeing screening? You can say 'Start PHQ-9', 'Start GAD-7', or 'Start GHQ'." }]);
        } else {
          setMessages([{ role: "assistant", content: "Hello! I'm Heal Buddy, your personal AI mental wellness companion. How are you feeling today?" }]);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [lastScreeningDate]);
  
  const startScreening = async (type: keyof typeof screeningOptions) => {
    setIsLoading(true);
    setScreeningType(type);
    setMessages(prev => [...prev, { role: "user", content: `I'd like to start the ${screeningOptions[type].name} screening.` }]);
    
    try {
      const input: ConversationalScreeningInput = { screeningType: type };
      const response = await conversationalScreening(input);
      if (response.nextQuestion) {
        setMessages(prev => [...prev, { role: "assistant", content: `Okay, let's start the ${screeningOptions[type].name} screening. I'll ask a series of questions.\n\n${response.nextQuestion}` }]);
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

    if (answer.toLowerCase().includes('start phq-9')) {
      startScreening('PHQ-9');
      return;
    }
    if (answer.toLowerCase().includes('start gad-7')) {
        startScreening('GAD-7');
        return;
    }
    if (answer.toLowerCase().includes('start ghq')) {
        startScreening('GHQ');
        return;
    }

    // AI will decide navigation
    setTimeout(() => {
        let response = "I'm here to listen. You can tell me about what's on your mind. If you'd like, we can also start a formal screening to get a better sense of how you're feeling. Just say `Start PHQ-9` for depression, `Start GAD-7` for anxiety, or `Start GHQ` for general well-being.";
        
        if (/\b(resource|article|help|tip)\b/i.test(answer)) {
            response = "It sounds like you're looking for some resources. I can guide you to our Resource Hub. It has articles, tools, and guided exercises. Would you like to go there?";
        } else if (/\b(peer|community|talk to someone)\b/i.test(answer)) {
            response = "Connecting with others can be really helpful. Our Peer Support page allows you to connect with people who have similar experiences. Would you like me to take you there?";
        } else if (/\b(counsellor|therapist|professional)\b/i.test(answer)) {
            response = "Speaking with a professional is a great step. I can help you find a counsellor. Would you like to see a list of available professionals?";
        }

        const finalResponse = `${response}\n\n${
            /\b(resource|article|help|tip)\b/i.test(answer) ? `[Go to Resource Hub](/resources)` : ''
        }${
            /\b(peer|community|talk to someone)\b/i.test(answer) ? `\n[Go to Peer Support](/peer-support)` : ''
        }${
            /\b(counsellor|therapist|professional)\b/i.test(answer) ? `\n[Find a Counsellor](/counsellor)` : ''
        }`;

        setMessages(prev => [...prev, { role: "assistant", content: finalResponse }]);
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
        
        const feedbackMessage = `${feedbackResponse.feedback}\n\n**Resource Recommendations:**\n${feedbackResponse.resourceRecommendations}\n\nWhat feels right for you now? We can explore resources, connect you with peer support, or help you find a counsellor.\n\n[Explore Resources](/resources)\n[Visit Peer Support](/peer-support)\n[Find a Counsellor](/counsellor)`;
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


  const renderers: Components = {
    a: (props: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
        const { href, children } = props;
        if (href) {
            return <Button asChild variant="link" className="p-0 h-auto text-base"><Link href={href}>{children}</Link></Button>
        }
        return <>{children}</>
    },
    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>
  };

  const suggestionPrompts = [
    "I'm feeling anxious",
    "I'm having trouble sleeping",
    "Start PHQ-9 Screening",
    "What are some coping strategies?",
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
        <header className="p-4 flex items-center justify-between">
            <Logo className="h-8 w-auto" />
        </header>
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef} viewportRef={viewportRef}>
            {messages.length === 0 && !isLoading ? (
                 <div className="flex flex-col items-center text-center">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Welcome to Heal Buddy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">This is a safe space to check in with your mental well-being. You can talk about what's on your mind, or take a guided screening. How can I help you today?</p>
                        </CardContent>
                    </Card>
                 </div>
            ) : (
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
                        "max-w-md lg:max-w-2xl rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                    >
                       <ReactMarkdown components={renderers}>{message.content}</ReactMarkdown>
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
            )}
        </ScrollArea>
        <div className="p-4 bg-transparent">
            <div className="relative mx-auto max-w-4xl bg-background/80 backdrop-blur-lg rounded-2xl border shadow-xl">
                {screeningType && currentQuestion ? (
                    <div className="p-4">
                        <p className="text-sm text-center text-muted-foreground mb-2">Please select a response for the question above:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {screeningOptions[screeningType].responseOptions.map(opt => (
                                <Button  key={opt} variant="outline" onClick={() => handleResponse(opt)} disabled={isLoading}>
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                <>
                    <Textarea 
                        placeholder="Message Heal Buddy..." 
                        className="flex-1 resize-none pr-14 pl-4 py-3 bg-transparent border-0 focus-visible:ring-0 h-32" 
                        rows={3}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleFreeformResponse();
                            }
                        }}
                    />
                    <Button 
                        onClick={handleFreeformResponse} 
                        disabled={isLoading || inputValue.trim() === ""} 
                        size="icon" 
                        className="absolute right-2 top-3/4 -translate-y-1/2 h-9 w-9 bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                        <ArrowUp size={20} />
                    </Button>
                </>
                )}
            </div>
            {(!screeningType || !currentQuestion) && (
                 <div className="mt-3 max-w-4xl mx-auto">
                     <p className="text-xs text-muted-foreground mb-2 px-2">Not sure where to start? Try one of these:</p>
                     <div className="flex flex-wrap gap-2">
                        {suggestionPrompts.map((prompt) => (
                             <Button 
                                key={prompt} 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full h-auto py-1 px-3 text-xs"
                                onClick={() => {
                                    setInputValue(prompt);
                                }}
                            >
                                 {prompt}
                             </Button>
                        ))}
                     </div>
                 </div>
            )}
             <p className="text-xs text-center text-muted-foreground mt-4">
                Heal Buddy is an AI assistant and is not a substitute for professional medical advice.
            </p>
        </div>
    </div>
  );
}
