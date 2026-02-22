'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Send, Paperclip, Smile, Camera } from 'lucide-react'
import type { Message } from '@/lib/supabase/types'

interface Profile {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
}

interface ConversationWithProfiles {
    id: string
    participant_1: string | null
    participant_2: string | null
    last_message_text: string | null
    last_message_at: string | null
    p1: Profile | null
    p2: Profile | null
}

interface Props {
    conversations: ConversationWithProfiles[]
    currentUserId: string
}

function Avatar({ profile, size = 48 }: { profile: Profile | null, size?: number }) {
    const initials = profile?.full_name?.charAt(0) ?? profile?.username?.charAt(0) ?? '?'
    if (profile?.avatar_url) {
        return (
            <img
                src={profile.avatar_url}
                alt={profile.full_name ?? 'Avatar'}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: size, height: size }}
            />
        )
    }
    return (
        <div
            className="rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <span className="font-bold text-[#00703C]" style={{ fontSize: size * 0.38 }}>{initials}</span>
        </div>
    )
}

export default function MessagerieClient({ conversations: initialConversations, currentUserId }: Props) {
    // ✅ Client Supabase stable géré via state pour éviter les re-renders
    const [supabase] = useState(() => createClient())

    const [conversations, setConversations] = useState<ConversationWithProfiles[]>(initialConversations)
    const [selectedConvo, setSelectedConvo] = useState<ConversationWithProfiles | null>(
        initialConversations[0] ?? null
    )
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [search, setSearch] = useState('')
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const seenMessageIds = useRef<Set<string>>(new Set())

    const getOtherProfile = (convo: ConversationWithProfiles) => {
        return convo.participant_1 === currentUserId ? convo.p2 : convo.p1
    }

    // ─── Charger les compteurs de messages non-lus au démarrage ───
    useEffect(() => {
        const fetchUnreads = async () => {
            const { data } = await supabase
                .from('messages')
                .select('id, conversation_id')
                .eq('is_read', false)
                .neq('sender_id', currentUserId)

            if (data) {
                const counts: Record<string, number> = {}
                data.forEach(m => {
                    const cid = m.conversation_id as string
                    counts[cid] = (counts[cid] ?? 0) + 1
                })
                setUnreadCounts(counts)
            }
        }
        fetchUnreads()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ─── Souscription Realtime sur la liste des conversations ───
    useEffect(() => {
        const channel = supabase
            .channel('conversations-list')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_1=eq.${currentUserId}`,
                },
                (payload) => {
                    const updated = payload.new as ConversationWithProfiles
                    setConversations(prev =>
                        prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)
                            .sort((a, b) =>
                                new Date(b.last_message_at ?? 0).getTime() - new Date(a.last_message_at ?? 0).getTime()
                            )
                    )
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_2=eq.${currentUserId}`,
                },
                (payload) => {
                    const updated = payload.new as ConversationWithProfiles
                    setConversations(prev =>
                        prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)
                            .sort((a, b) =>
                                new Date(b.last_message_at ?? 0).getTime() - new Date(a.last_message_at ?? 0).getTime()
                            )
                    )
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId])

    // ─── Charger les messages + souscription Realtime sur la conversation sélectionnée ───
    useEffect(() => {
        if (!selectedConvo) return

        setMessages([])
        seenMessageIds.current = new Set()

        const loadMessages = async () => {
            console.log('[Messagerie] Chargement messages pour:', selectedConvo.id)

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedConvo.id)
                .order('created_at', { ascending: true })

            console.log('[Messagerie] Résultat:', { data, error, count: data?.length })

            if (error) {
                console.error('[Messagerie] ERREUR RLS ou réseau:', error)
                return
            }

            if (data && data.length > 0) {
                data.forEach(m => seenMessageIds.current.add(m.id))
                setMessages(data)
            }

            // Marquer les messages comme lus (best effort, peut échouer si pas de politique UPDATE)
            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', selectedConvo.id)
                .eq('is_read', false)
                .neq('sender_id', currentUserId)

            if (updateError) {
                console.warn('[Messagerie] Impossible de marquer comme lu:', updateError.message)
            }

            setUnreadCounts(prev => ({ ...prev, [selectedConvo.id]: 0 }))
        }

        loadMessages()

        // Channel Realtime pour les nouveaux messages
        const channelName = `messages-${selectedConvo.id}-${Date.now()}`
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedConvo.id}`,
                },
                async (payload) => {
                    const msg = payload.new as Message
                    if (!seenMessageIds.current.has(msg.id)) {
                        seenMessageIds.current.add(msg.id)
                        setMessages(prev => [...prev, msg])

                        // Marquer immédiatement comme lu si c'est un message reçu dans la convo ouverte
                        if (msg.sender_id !== currentUserId) {
                            await supabase
                                .from('messages')
                                .update({ is_read: true })
                                .eq('id', msg.id)
                        }
                    }
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConvo?.id])

    // ─── Auto-scroll ───
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConvo) return
        setSending(true)
        const text = newMessage.trim()
        setNewMessage('')

        await supabase.from('messages').insert({
            conversation_id: selectedConvo.id,
            sender_id: currentUserId,
            text,
        })

        await supabase
            .from('conversations')
            .update({ last_message_text: text, last_message_at: new Date().toISOString() })
            .eq('id', selectedConvo.id)

        setSending(false)
    }

    const filteredConvos = conversations.filter(c => {
        const other = getOtherProfile(c)
        const name = other?.full_name ?? other?.username ?? ''
        return name.toLowerCase().includes(search.toLowerCase())
    })

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-[#E8E3D0] flex flex-col">
                <div className="p-6 border-b border-[#E8E3D0]">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-[#1A1A1A]">Messagerie</h1>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8A]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full bg-[#F5F0DC] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00703C]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConvos.length === 0 ? (
                        <div className="p-6 text-center text-[#9A9A8A] text-sm">
                            Aucune conversation
                        </div>
                    ) : (
                        filteredConvos.map(convo => {
                            const other = getOtherProfile(convo)
                            const isSelected = selectedConvo?.id === convo.id
                            const unread = unreadCounts[convo.id] ?? 0
                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => setSelectedConvo(convo)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 border-b border-[#E8E3D0]/60 text-left transition-colors ${isSelected ? 'bg-[#E8F5EE]' : 'hover:bg-[#F5F0DC]'
                                        }`}
                                >
                                    <div className="relative">
                                        <Avatar profile={other} size={48} />
                                        {/* ✅ Badge non-lu dynamique */}
                                        {unread > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00703C] flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{unread > 9 ? '9+' : unread}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-[#1A1A1A]' : 'font-semibold text-[#1A1A1A]'}`}>
                                                {other?.full_name ? (
                                                    <>
                                                        {other.full_name.split(' ')[0]}{' '}
                                                        <span className="font-bold uppercase">{other.full_name.split(' ').slice(1).join(' ')}</span>
                                                    </>
                                                ) : other?.username ?? 'Utilisateur'}
                                            </p>
                                            <span className="text-xs text-[#E36B39] ml-2 flex-shrink-0">
                                                {formatTime(convo.last_message_at)}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-[#1A1A1A] font-medium' : 'text-[#9A9A8A]'}`}>
                                            {convo.last_message_text ?? 'a envoyé un message'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {selectedConvo ? (
                    <>
                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8E3D0] bg-white">
                            <Avatar profile={getOtherProfile(selectedConvo)} size={42} />
                            <div>
                                <p className="font-bold text-[#1A1A1A]">
                                    {(() => {
                                        const other = getOtherProfile(selectedConvo)
                                        if (!other?.full_name) return other?.username ?? 'Utilisateur'
                                        const parts = other.full_name.split(' ')
                                        return <>{parts[0]} <span className="uppercase">{parts.slice(1).join(' ')}</span></>
                                    })()}
                                </p>
                                <p className="text-xs text-[#00703C]">En ligne</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 && (
                                <div className="flex items-center justify-center h-full text-[#9A9A8A] text-sm">
                                    Commencez la discussion ! 👋
                                </div>
                            )}
                            {messages.map(msg => {
                                const isMine = msg.sender_id === currentUserId
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-sm px-4 py-3 ${isMine ? 'bubble-sent' : 'bubble-received'}`}
                                        >
                                            <p className="text-sm text-[#1A1A1A] leading-relaxed">{msg.text}</p>
                                            <p className="text-xs text-[#9A9A8A] mt-1 text-right">
                                                {formatTime(msg.created_at)}
                                                {isMine && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="px-6 py-4 border-t border-[#E8E3D0] bg-white">
                            <div className="flex items-center gap-3 bg-[#F5F0DC] rounded-2xl px-4 py-3">
                                <button className="text-[#9A9A8A] hover:text-[#00703C] transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (newMessage.trim() && !sending) {
                                                sendMessage();
                                            }
                                        }
                                    }}
                                    placeholder="Écrivez votre message ici..."
                                    className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-[#9A9A8A] focus:outline-none"
                                />
                                <button className="text-[#9A9A8A] hover:text-[#00703C] transition-colors">
                                    <Smile size={20} />
                                </button>
                                <button className="text-[#9A9A8A] hover:text-[#00703C] transition-colors">
                                    <Camera size={20} />
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="w-10 h-10 rounded-full bg-[#00703C] flex items-center justify-center hover:bg-[#005A30] transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    <Send size={16} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-[#9A9A8A]">
                        <div>
                            <div className="w-20 h-20 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
                                <Send size={32} className="text-[#00703C]" />
                            </div>
                            <p className="font-medium">Sélectionnez une conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
