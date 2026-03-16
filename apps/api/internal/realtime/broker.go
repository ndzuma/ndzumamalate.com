package realtime

import (
	"sync"

	"ndzumamalate.com/apps/api/internal/models"
)

type Broker struct {
	mu      sync.RWMutex
	nextID  int
	clients map[int]chan models.Event
}

func NewBroker() *Broker {
	return &Broker{clients: map[int]chan models.Event{}}
}

func (b *Broker) Subscribe() (int, <-chan models.Event, func()) {
	b.mu.Lock()
	defer b.mu.Unlock()

	id := b.nextID
	b.nextID++
	ch := make(chan models.Event, 16)
	b.clients[id] = ch

	return id, ch, func() {
		b.mu.Lock()
		defer b.mu.Unlock()
		if existing, ok := b.clients[id]; ok {
			delete(b.clients, id)
			close(existing)
		}
	}
}

func (b *Broker) Publish(event models.Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for _, ch := range b.clients {
		select {
		case ch <- event:
		default:
		}
	}
}
