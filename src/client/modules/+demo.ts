import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {SharedModule} from './';
import {DemoComponent} from '../components/demo/component';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', component: DemoComponent},
            ]
        )
    ],
    declarations: [
        DemoComponent
    ],
    exports: [
        DemoComponent,
    ]
})
export class LazyDemoModule { }
