import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: Date })
    expiresAt: Date;

    @ManyToOne(() => User) // Many tokens belong to one user (Many tokens : If user logins from mobile, desktop, ipad etc.. hence multiple tokens)
    user: User; // In DB, userId column is created and made FK

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
