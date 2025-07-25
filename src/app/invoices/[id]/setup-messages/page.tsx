'use client'

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

export default function SetupMessagesPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter();
    const { id } = use(params);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
            <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card>
                    <CardHeader className="text-center">
                        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle>Message Setup Coming Soon!</CardTitle>
                        <CardDescription>
                            Invoice {id} created successfully. The message generation feature will be implemented next.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button onClick={() => router.push('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}